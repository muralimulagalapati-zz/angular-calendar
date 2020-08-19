export interface IrequestsObject {
  id: number;
  name: string;
  description: string;
  scheduleid: number;
}

export interface IserverEvent {
  title: string;
  color: string;
  id: number;
  allDay ?: boolean;
  resizable ?: any;
  draggable ?: boolean;
  start ?: string;
  end ?: string;
  [any: string]: any;
}
