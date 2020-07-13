export enum PushType {
  Next,
  Complete,
  Error,
}

export type PushItem<T, Te> =
  | [PushType.Next, T]
  | [PushType.Complete]
  | [PushType.Error, Te];
