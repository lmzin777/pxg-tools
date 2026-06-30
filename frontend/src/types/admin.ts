export type SyncRun = {
  id: string;
  source: string;
  scope: string;
  status: string;
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
  message: string;
  errorMessage: string;
  recordsLoaded: number;
};

export type AdminStats = {
  generatedAt: string;
  tables: Array<{
    scope: string;
    tableName: string;
    records: number;
  }>;
  recentErrors: SyncRun[];
};

export type AdminHealth = {
  status: string;
  database: string;
  checkedAt: string;
};
