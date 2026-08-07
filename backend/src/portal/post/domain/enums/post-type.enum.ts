// Mirrors the Prisma PostType enum. Declared here because the domain layer may
// not import Prisma — only infrastructure/persistence may (Principle I).
export enum PostType {
  BERITA = 'BERITA',
  ARTIKEL = 'ARTIKEL',
  PENGUMUMAN = 'PENGUMUMAN',
}
