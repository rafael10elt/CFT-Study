/**
 * Re-export do fallback educacional offline do tutor.
 * A implementação vive em `@shared/tutorFallback` para ser reutilizada
 * pelo servidor (tRPC) e pelo cliente (deploy estático sem backend).
 */
export * from "@shared/tutorFallback";
