import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  OnInit
} from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http'
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  parseISO,
} from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';

type serverEvent = {
  title: string,
  color: string,
  id: number,
  allDay ?: boolean,
  actions ?: any,
  resizable ?: any,
  draggable ?: boolean,
  start ?: string,
  end ?: string,
  [any: string]: any,
}

type requestsObject = {
  id: number,
  name: string,
  description: string,
  scheduleid: number
}

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['app.component.css'],
  templateUrl: 'app.component.html',
  providers: [ NgbActiveModal ], 
})
export class AppComponent {

  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;
  @ViewChild('editModalContent', { static: true }) editModalContent: TemplateRef<any>
  events$: Observable<any>;
  requests$: Observable<any>;
  edit$: Observable<any>;
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  modalData: { event: CalendarEvent };
  refresh: Subject<any> = new Subject();
  activeDayIsOpen: boolean = false;
  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    }
  ];

  constructor(
    private http: HttpClient,
    private activeModal: NgbActiveModal,
    private modal: NgbModal
  ) {}

  ngOnInit(): void {
    this.fetchEvents();
  }

  fetchEvents(): void {
    this.events$ = this.http
      .get('http://localhost:3000/scheduler')
      .pipe(
        map(({ results }: { results: serverEvent[] }) => {
          return results.map((event: serverEvent) => {
            return {
              ...event,
              actions: this.actions,
              start: event.start ? parseISO(event.start) : new Date(),
              end: event.end ? parseISO(event.end) : new Date(),
            }
          });
        })
      );
  }

  fetchRequests(event): void {
    const { id } = event
    this.requests$ = this.http
      .get(`http://localhost:3000/requests/${id}`)
      .pipe(
        map(({ results }: { results: requestsObject[]}) => results)
      )
  } 

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  // eventTimesChanged({
  //   event,
  //   newStart,
  //   newEnd,
  // }: CalendarEventTimesChangedEvent): void {
  //   this.events = this.events.map((iEvent) => {
  //     if (iEvent === event) {
  //       return {
  //         ...event,
  //         start: newStart,
  //         end: newEnd,
  //       };
  //     }
  //     return iEvent;
  //   });
  //   this.handleEvent('Dropped or resized', event);
  // }

  handleEvent(action: string, event: CalendarEvent): void {
    this.activeModal && this.activeModal.close()
    this.modalData = { event };
    this.activeModal = this.modal.open(this.modalContent, { size: 'lg' });
    this.fetchRequests(event)
  }

  editModal(event: CalendarEvent): void {
    this.activeModal.close()
    this.modalData = { event }
    this.activeModal = this.modal.open(this.editModalContent, { size: 'lg' })
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  editEvent(prevData) {
    const formEl = document.getElementById('editForm') as HTMLFormElement
    const formDataJS = new FormData(formEl)
    this.activeModal.close() // Close the modal after we get form element not before.

    const modified = {
      start: formDataJS.get('startdate'),
      end: formDataJS.get('enddate'),
      description: formDataJS.get('description')
    }

    if (modified.start !== prevData.start
      || modified.end !== prevData.end
      || modified.description !== prevData.description) {
      this.editEventService({...prevData, ...modified})
    }
  }

  editEventService(event): void {
    console.log("event.id", event.id)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    console.log("event.id", event.id)

    this.edit$ = this.http.get(`http://localhost:3000/scheduler`)
  }
}
