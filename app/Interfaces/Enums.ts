export enum Database {
  MySQL = 'MySQL',
  PostgreSQL = 'PostgreSQL',
}

export enum HostingPorts {
  nginxApi = 30000, // Node BE files server by Nginx
  nginxUi = 10000, // Static FE files server by Nginx
  nodeApi = 20000, // Node BE files server by PM2
}

export enum Mailer {
  SMTP = 'SMTP',
  SES = 'SES',
  Mailgun = 'Mailgun',
  SparkPost = 'SparkPost',
}

export enum ProjectType {
  API = 'API',
  SSR = 'SSR',
}

export enum Storage {
  Local = 'Local',
  S3 = 'S3',
  GCS = 'GCS',
}

export enum Backend {
  Adonis = 'Adonis',
}

export enum Frontend {
  Buefy = 'Buefy',
}

export enum RelationType {
  HasOne = 'HasOne',
  HasMany = 'HasMany',
  BelongsTo = 'BelongsTo',
  ManyToMany = 'ManyToMany',
}

export enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export enum APIInput {
  STRING = 'String',
  DECIMAL = 'Decimal',
  INTEGER = 'Integer',
  DATE = 'Date',
  BOOLEAN = 'Boolean',
  FILE = 'File',
}

export enum UIInput {
  INPUT = 'Input',
  SELECT = 'Select',
  RADIO = 'Radio',
  CHECKBOX = 'Checkbox',
}

// Prices in dollar
export enum Price {
  api = 5,
  app = 5,
  spa = 5,
}

export enum PaymentStatus {
  started = 'started',
  processing = 'processing',
  done = 'done',
  failed = 'failed',
}
