export type UserRole = "admin" | "coordinador" | "instructor";

export type IconName =
  | "layout-dashboard"
  | "building-2"
  | "map-pinned"
  | "users"
  | "shield-check"
  | "graduation-cap"
  | "book-open-text"
  | "folders"
  | "school"
  | "door-open"
  | "git-branch-plus"
  | "scan-search"
  | "sheet"
  | "house"
  | "calendar-days"
  | "clipboard-list";

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  badge?: string;
};

export type RoleProfile = {
  role: UserRole;
  label: string;
  initials: string;
  userName: string;
  userTitle: string;
  team: string;
  summary: string;
  quickAction: string;
  homeHref: string;
};

export type Metric = {
  label: string;
  value: string;
  helper: string;
  trend: string;
};

export type ActivityRow = {
  id: string;
  item: string;
  owner: string;
  status: "Al dia" | "En revision" | "Pendiente";
  updatedAt: string;
};

export type AssignmentItem = {
  id: string;
  title: string;
  location: string;
  time: string;
  status: "Programada" | "Requiere ajuste" | "Confirmada";
};

export type AgendaItem = {
  id: string;
  day: string;
  title: string;
  time: string;
  place: string;
};

export type DashboardData = {
  title: string;
  description: string;
  metrics: Metric[];
  activity: ActivityRow[];
  assignments: AssignmentItem[];
  agenda: AgendaItem[];
};

export type CoordinatorAvailability = "Alta" | "Media" | "Limitada";
export type CoordinatorInstructorStatus = "Disponible" | "Parcial" | "No disponible";
export type CoordinatorSiteDependency = "centro" | "colegio" | "virtual";
export type CoordinatorAssignmentStatus = "Confirmada" | "Requiere ajuste" | "Pendiente";
export type CoordinatorSchoolStatus = "Activo" | "Seguimiento" | "Pendiente cupo";
export type CoordinatorEnvironmentStatus = "Disponible" | "Reservado" | "Mantenimiento";
export type CoordinatorOperationalDependency =
  | "Articulacion"
  | "Titulada"
  | "Complementaria";
export type CoordinatorArticulationMode =
  | "No aplica"
  | "Compartida"
  | "Unica"
  | "Colegio privado";
export type CoordinatorFichaOperationalStatus =
  | "Sin asignar"
  | "Parcial"
  | "Completa";
export type CoordinatorConflictSeverity = "alta" | "media" | "baja";
export type CoordinatorEnvironmentCellState =
  | "Libre"
  | "Ocupado"
  | "Conflicto"
  | "Mantenimiento";
export type CoordinatorEnvironmentCatalogStatus =
  | "Activo"
  | "Mantenimiento"
  | "Inactivo";
export type CoordinatorAssignmentFlowTab = "new" | "active" | "history";
export type CoordinatorAssignmentFlowMode = "create" | "edit" | "reassign";
export type CoordinatorAssignmentRecordStatus =
  | "Borrador"
  | "Activa"
  | "Pendiente"
  | "Parcial"
  | "Reasignada"
  | "Cerrada";
export type CoordinatorAssignmentHistoryAction =
  | "Creada"
  | "Editada"
  | "Reasignada"
  | "Cerrada";

export type CoordinatorInstructor = {
  id: string;
  name: string;
  specialty: string;
  center: string;
  city: string;
  contractType: string;
  modalities: string[];
  programs: string[];
  availability: CoordinatorAvailability;
  hoursAssigned: number;
  loadPercent: number;
  status: CoordinatorInstructorStatus;
  nextWindow: string;
};

export type CoordinatorFicha = {
  id: string;
  code: string;
  program: string;
  center: string;
  city: string;
  modality: string;
  jornada: string;
  dependency: CoordinatorSiteDependency;
  requiresEnvironment: boolean;
  apprentices: number;
  schedule: string;
  stage: string;
  status: "Lista para asignar" | "En curso" | "Pendiente cobertura";
  suggestedCollegeId?: string;
};

export type CoordinatorSchool = {
  id: string;
  name: string;
  city: string;
  coordinator: string;
  contact: string;
  activeGroups: number;
  priorityPrograms: string[];
  environments: string[];
  status: CoordinatorSchoolStatus;
  nextVisit: string;
};

export type CoordinatorEnvironment = {
  id: string;
  name: string;
  siteName: string;
  city: string;
  capacity: number;
  type: string;
  dependency: Exclude<CoordinatorSiteDependency, "virtual">;
  availability: CoordinatorEnvironmentStatus;
  equipment: string[];
};

export type CoordinatorAssignmentDraft = {
  id: string;
  fichaId: string;
  instructorId: string;
  schoolId?: string;
  environmentId?: string;
  status: CoordinatorAssignmentStatus;
  scheduleLabel: string;
  notes: string;
};

export type CoordinatorSiteOption = {
  id: string;
  label: string;
};

export type CoordinatorAlertChip = {
  id: string;
  label: string;
  severity: CoordinatorConflictSeverity;
};

export type CoordinatorOperationalMetric = {
  label: string;
  value: string;
  tone: "neutral" | "warning" | "danger";
};

export type CoordinatorOperationalInstructor = {
  id: string;
  name: string;
  initials: string;
  photoUrl: string;
  phone: string;
  personalEmail: string;
  profession: string;
  dependency: CoordinatorOperationalDependency;
  area: string;
  programType: string;
  site: string;
  contractStartDate: string;
  contractEndDate: string;
  currentLoad: string;
  activeBlocks: number;
  status: "Disponible" | "Parcial" | "Saturado";
  articulationSchool?: string;
  articulationMode?: Exclude<CoordinatorArticulationMode, "No aplica">;
  articulationShift?: Exclude<CoordinatorFichaShift, "Noche" | "Por definir">;
  locality?: string;
};

export type CoordinatorOperationalFicha = {
  id: string;
  number: string;
  program: string;
  dependency: CoordinatorOperationalDependency;
  site: string;
  block: string;
  shift: string;
  articulationMode: CoordinatorArticulationMode;
  status: CoordinatorFichaOperationalStatus;
  requiresSchool: boolean;
  requiresEnvironment: boolean;
  schoolOptions: string[];
  environmentOptions: string[];
};

export type CoordinatorOperationalSchool = {
  id: string;
  name: string;
  city: string;
  coverage: string;
  activeFichas: number;
  modalityMix: CoordinatorArticulationMode[];
  coordinator: string;
  status: "Con cobertura" | "Parcial" | "Critico";
};

export type CoordinatorAssignmentConflict = {
  id: string;
  severity: CoordinatorConflictSeverity;
  message: string;
};

export type CoordinatorEnvironmentMatrixCell = {
  id: string;
  block: string;
  state: CoordinatorEnvironmentCellState;
  ficha?: string;
  instructor?: string;
};

export type CoordinatorEnvironmentMatrixRow = {
  id: string;
  name: string;
  site: string;
  type: string;
  capacity: number;
  cells: CoordinatorEnvironmentMatrixCell[];
};

export type CoordinatorEnvironmentCatalogItem = {
  id: string;
  code: string;
  site: string;
  capacity: number;
  type: CoordinatorOperationalDependency;
  status: CoordinatorEnvironmentCatalogStatus;
};

export type CoordinatorAssignmentEnvironmentSelection = {
  id: string;
  rowId: string;
  environmentName: string;
  block: string;
  site: string;
  dependency: Extract<CoordinatorOperationalDependency, "Titulada" | "Complementaria">;
};

export type CoordinatorAssignmentRecord = {
  id: string;
  dependency: CoordinatorOperationalDependency;
  fichaId: string;
  fichaNumber: string;
  program: string;
  siteContext: string;
  shift: CoordinatorFichaShift;
  instructorId: string;
  instructorName: string;
  instructorArea: string;
  schoolId?: string;
  schoolName?: string;
  locality?: string;
  modality?: Exclude<CoordinatorArticulationMode, "No aplica">;
  environmentName?: string;
  selectedBlocks: string[];
  hoursAssigned: number;
  status: CoordinatorAssignmentRecordStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type CoordinatorAssignmentHistoryEntry = {
  id: string;
  assignmentId: string;
  action: CoordinatorAssignmentHistoryAction;
  dependency: CoordinatorOperationalDependency;
  fichaNumber: string;
  instructorName: string;
  summary: string;
  actor: string;
  happenedAt: string;
};

export type CoordinatorArticulationCoverageRow = {
  id: string;
  instructor: string;
  ficha: string;
  school: string;
  site: string;
  articulationMode: CoordinatorArticulationMode;
  coverage: string;
  status: "Cubierta" | "Parcial" | "Pendiente";
};

export type CoordinatorArticulationShift = "Manana" | "Tarde";

export type CoordinatorArticulationInstructor = {
  id: string;
  name: string;
  initials: string;
  area: string;
  site: string;
  hoursAssigned: number;
  status: "Libre" | "Parcial" | "Cubierto";
};

export type CoordinatorArticulationFichaUnit = {
  id: string;
  schoolId: string;
  number: string;
  program: string;
  modality: Exclude<CoordinatorArticulationMode, "No aplica">;
  shift: CoordinatorArticulationShift;
  hoursRequired: number;
  apprenticeCount: number;
  coverageStatus: CoordinatorFichaOperationalStatus;
  assignedInstructors: string[];
  site: string;
};

export type CoordinatorArticulationSchoolUnit = {
  id: string;
  name: string;
  address: string;
  city: string;
  site: string;
  totalFichas: number;
  generalCoverage: string;
  fichas: CoordinatorArticulationFichaUnit[];
};

export type CoordinatorSchoolKind = "Publico" | "Privado" | "Tecnico";
export type CoordinatorSchoolOperationalStatus =
  | "Pendiente horario"
  | "Con horario definido"
  | "Listo para asignacion";

export type CoordinatorSchoolCard = {
  id: string;
  name: string;
  kind: CoordinatorSchoolKind;
  address: string;
  city: string;
  site: string;
  scheduleLabel: string;
  operatingDays: string;
  senaCoverageSummary: string;
  monthlyRule: string;
  operationalStatus: CoordinatorSchoolOperationalStatus;
  hasSchedule: boolean;
  readyForAssignment: boolean;
};

export type CoordinatorSchoolAssociatedFicha = {
  id: string;
  number: string;
  program: string;
  status: "Pendiente" | "Parcial" | "Lista";
};

export type CoordinatorSchoolDetail = CoordinatorSchoolCard & {
  journeys: string;
  scheduleWindows: string[];
  participationMode: string;
  observations: string;
  associatedFichas: CoordinatorSchoolAssociatedFicha[];
};

export type CoordinatorFichaShift = "Manana" | "Tarde" | "Noche" | "Por definir";

export type CoordinatorFichaStateTag =
  | "Sin aprendices"
  | "Carga parcial"
  | "Completa"
  | "Sin instructor"
  | "Sin ambiente"
  | "Lista para operacion";

export type CoordinatorFichaGeneralStatus =
  | "Configuracion inicial"
  | "En alistamiento"
  | "Lista para operacion";

export type CoordinatorFichaSummary = {
  id: string;
  number: string;
  program: string;
  dependency: CoordinatorOperationalDependency;
  programType: string;
  shift: CoordinatorFichaShift;
  site: string;
  expectedApprentices: number;
  apprenticeCount: number;
  assignedInstructor?: string;
  assignedEnvironment?: string;
  articulationSchool?: string;
  articulationMode?: Exclude<CoordinatorArticulationMode, "No aplica">;
  locality?: string;
  requiresEnvironment: boolean;
  generalStatus: CoordinatorFichaGeneralStatus;
  stateTags: CoordinatorFichaStateTag[];
  observations: string;
  createdAt: string;
  updatedAt: string;
  lastImportAt?: string;
  updatedBy: string;
};

export type CoordinatorFichaLearner = {
  id: string;
  documentType: string;
  documentNumber: string;
  fullName: string;
  email: string;
  phone: string;
  source: "Excel" | "Manual";
  registeredAt: string;
};

export type CoordinatorFichaTraceability = {
  createdAt: string;
  updatedAt: string;
  lastImportAt?: string;
  updatedBy: string;
  lastImportBy?: string;
};

export type CoordinatorFichaImportMock = {
  fileName: string;
  sheetName: string;
  uploadedAt: string;
  columns: ImportColumnReport[];
  previewRows: ImportPreviewRow[];
  issues: ImportIssue[];
  validLearners: CoordinatorFichaLearner[];
};

export type CoordinatorFichaDetail = CoordinatorFichaSummary & {
  apprentices: CoordinatorFichaLearner[];
  traceability: CoordinatorFichaTraceability;
  importMock?: CoordinatorFichaImportMock;
};

export type ImportColumnStatus = "Valida" | "Advertencia" | "Invalida";
export type ImportRowStatus = "Valido" | "Con observaciones" | "Con error";
export type ImportIssueSeverity = "alta" | "media" | "baja";

export type ImportColumnReport = {
  key: string;
  label: string;
  mappedTo: string;
  status: ImportColumnStatus;
  coverage: string;
  detail: string;
};

export type ImportPreviewRow = {
  id: string;
  status: ImportRowStatus;
  values: Record<string, string>;
};

export type ImportIssue = {
  id: string;
  severity: ImportIssueSeverity;
  rowRef: string;
  column: string;
  message: string;
  recommendation: string;
};

export type ImportBatchSummary = {
  fileName: string;
  uploadedAt: string;
  sheetName: string;
  detectedEntity: string;
  recordsDetected: number;
  validRecords: number;
  warningRecords: number;
  errorRecords: number;
  processedPercent: number;
};

export type InstructorDependency = "Centro" | "Colegio" | "Virtual";
export type InstructorArticulationMode = "No aplica" | "Articulacion media" | "Doble titulacion";
export type InstructorAssignmentState = "Confirmada" | "Programada" | "Requiere ajuste";

export type InstructorAssignmentDetail = {
  id: string;
  ficha: string;
  programa: string;
  dependencia: InstructorDependency;
  sede: string;
  ambiente: string;
  colegio?: string;
  articulacion: InstructorArticulationMode;
  modalidad: string;
  jornada: string;
  horario: string;
  aprendices: number;
  estado: InstructorAssignmentState;
  novedades: string;
};

export type InstructorAgendaEntry = {
  id: string;
  dateLabel: string;
  dayName: string;
  startTime: string;
  endTime: string;
  title: string;
  ficha: string;
  programa: string;
  dependencia: InstructorDependency;
  sede: string;
  ambiente: string;
  colegio?: string;
  articulacion: InstructorArticulationMode;
  modalidad: string;
  note: string;
};

export type InstructorAttendanceState =
  | "Lista para registrar"
  | "Registrada"
  | "Pendiente cierre";

export type InstructorAttendanceEntry = {
  id: string;
  ficha: string;
  programa: string;
  dateLabel: string;
  expected: number;
  attended: number;
  pending: number;
  state: InstructorAttendanceState;
};

export type InstructorEvidenceState = "Cargada" | "Pendiente" | "Revisar";

export type InstructorEvidenceEntry = {
  id: string;
  ficha: string;
  programa: string;
  title: string;
  type: string;
  dueLabel: string;
  channel: string;
  state: InstructorEvidenceState;
};
