import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { parseISO } from 'date-fns'
import { CalendarEvent, CalendarEventAction } from 'angular-calendar'
import {
  IserverEvent,
  IrequestsObject
} from './app.interfaces'

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private _events = new BehaviorSubject<CalendarEvent<IserverEvent>[]>([])
  private _requests = new BehaviorSubject<IrequestsObject[]>([])
  private baseUrl = 'http://127.0.0.1:3000'
  private eventStore: any[] = []
  readonly events = this._events.asObservable()
  readonly requests = this._requests.asObservable()
  
  constructor(private http: HttpClient) {}

  fetchAllEvents(): void {
    this.http.get(`${this.baseUrl}/scheduler`)
    .subscribe(
      ({ results }: { results: any[]}) => {
        this.eventStore = results.map((event) => ({
          ...event,
          start: event.start ? parseISO(event.start) : new Date(),
          end: event.end ? parseISO(event.end) : new Date(),
        }))
        this._events.next([...this.eventStore])
      },
      error => console.error('Error in loading all events', error)
    )
  }

  updateEvent(event): void {
    const { id } = event
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      responseType: 'text' as const
    }

    this.http.patch(`${this.baseUrl}/scheduler/${id}`, { event }, httpOptions)
    .subscribe(
      () => {
        this.eventStore.forEach((ev, index) => {
          if (ev.id == id) {
            this.eventStore[index] = {
              ...event,
              start: event.start ? parseISO(event.start) : new Date(),
              end: event.end ? parseISO(event.end) : new Date(),
            }
          }
        })
        this._events.next([...this.eventStore])
        /**
         * Or, use this.
         * However this will make another API call to get all events.
         * If the data is large don't use this.
         * It could be useful in updating a serries.
         */
        // this.loadAllEvents()
      },
      error => console.error(`Error in editing the event with id: ${id}`, error)
    )
  }

  fetchEventRequests(eventid): void {
    this.http.get(`${this.baseUrl}/requests/${eventid}`)
    .subscribe(
      ({ results }: { results: any[]}) => this._requests.next([...results]),
      error => console.error(`Error in loading request for event ${eventid}`, error)
    )
  }
}
