export interface AuthProfile {
  id?: string
  name?: string | null
  email?: string | null
  avatar?: string | null
}

export interface AuthUser {
  id: string
  identifier: string
  isActive: boolean
  roles: string[]
  permissions: string[]
  organizationId?: string | null
  schoolUnitId?: string | null
  name?: string | null
  profile?: AuthProfile | null
  // No `student` or `teacher` here.
  //
  // Both were declared and neither was ever populated — `GET /auth/me` returns
  // identity, roles and permissions, and nothing else has ever written to
  // them. Their one reader checked `user.student.classroomId`, found undefined
  // every time, and returned early; a student's schedule has never rendered
  // because of it.
  //
  // They are not filled in, they are removed. CLAUDE.md makes `/auth/me` the
  // source of identity and permissions, and widening it invites authorization
  // to be decided from a record rather than from a grant. Whose data a screen
  // shows is answered by the server, from the caller's own records, behind the
  // `.../me` reads.
}
