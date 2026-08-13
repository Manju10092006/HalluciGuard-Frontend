# HalluciGuard Integration Architecture Specification

> **Architecture Style**: Adapter & Facade Pattern + Strongly Typed Contracts + Transport Abstraction  
> **Target Execution**: Next.js 15 (App Router), TypeScript  
> **Rule**: UI components must NEVER call `fetch()`, `axios`, or specific backend SDKs directly. All requests pass through `VerificationService`.

---

## 1. Integration Architecture Diagram

```
┌────────────────────────────────────────────────────────┐
│                   React UI Layer                       │
│    (ChatConsole, VerificationCard, StudioCenterPanel)  │
└───────────────────────────┬────────────────────────────┘
                            │ (verifyPrompt, replaySession)
                            ▼
┌────────────────────────────────────────────────────────┐
│             VerificationService (Facade)              │
└───────────────────────────┬────────────────────────────┘
                            │ (delegates to active adapter)
                            ▼
┌────────────────────────────────────────────────────────┐
│          IVerificationAdapter (Interface)              │
├─────────────────┬───────────────────┬──────────────────┤
│   MockAdapter   │ HalluciGuardAdapter│ OpenAI / Gemini  │
│   (Current)     │ (Python LangGraph)│ (LLM Direct)     │
└────────┬────────┴─────────┬─────────┴────────┬─────────┘
         │                  │                  │
         ▼                  ▼                  ▼
┌────────────────────────────────────────────────────────┐
│               ITransport (Layer)                       │
├───────────────┬─────────────────────┬──────────────────┤
│ EventTransport│ WebSocketTransport  │ Http / SSE       │
└────────┬──────┴───────────┬─────────┴────────┬─────────┘
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────────┐  ┌────────────────┐  ┌──────────────┐
│  Mock EventBus  │  │ Python Backend │  │ Cloud LLM API│
└─────────────────┘  └────────────────┘  └──────────────┘
```

---

## 2. Adapter Pattern

Every verification engine adapter implements `IVerificationAdapter`:

```typescript
export interface IVerificationAdapter {
  id: string;
  name: string;
  verify(prompt: string, mode: VerificationMode, model: string): Promise<void>;
  cancel(sessionId: string): Promise<void>;
  replay(sessionId: string): Promise<void>;
  health(): Promise<AdapterHealthStatus>;
  getCapabilities(): AdapterCapabilities;
}
```

### Available Adapters
- `MockAdapter`: Wraps simulated multi-stage event generator (`runMockVerification`).
- `HalluciGuardAdapter`: Connects to real Python LangGraph multi-agent WebSocket endpoints (`/api/v1/verify`).
- `OpenAIAdapter` / `GeminiAdapter` / `ClaudeAdapter`: Direct LLM API provider integrations.
- `OllamaAdapter`: Local offline LLM runner integration.

---

## 3. Transport Layer Abstraction

All wire communications inherit from `ITransport`:
- `EventTransport`: In-memory event bus transport for offline mock runs.
- `WebSocketTransport`: Bi-directional streaming for real-time agent execution events.
- `SSETransport`: Server-Sent Events stream transport.
- `HttpTransport`: Standard REST JSON transport.

---

## 4. Backend Contracts & Schemas

Defined in `src/services/verification/contracts/`:
- `VerificationRequestContract`: `{ prompt, mode, model, options }`
- `VerificationResponseContract`: `{ sessionId, rawCandidateResponse, verifiedResponse, overallConfidence }`
- `BackendAgentEventContract`: `{ eventId, eventType, timestamp, agentId, progress, payload }`
- `ClaimContract`, `EvidenceContract`, `MemoryContract`, `CertificateContract`.

---

## 5. Event Mapping & Error Translation

`EventMapper.mapAndEmit()` maps backend string event names (e.g. `claims_extracted`) into frontend typed EventBus events (`CLAIMS_EXTRACTED`).

`ErrorMapper.mapError()` centralizes error handling into user-friendly diagnostic objects (`TIMEOUT`, `DISCONNECTED`, `RATE_LIMITED`).
