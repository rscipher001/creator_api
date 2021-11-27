export enum Database {
  MySQL = 'MySQL',
  PostgreSQL = 'PostgreSQL',
}

export enum Mailer {
  SMTP = 'SMTP',
  SES = 'SES',
  MailGun = 'MailGun',
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

export enum RelationType {
  hasOne = 'hasOne',
  hasMany = 'hasMany',
  belongsTo = 'belongsTo',
  manyToMany = 'manyToMany',
}
