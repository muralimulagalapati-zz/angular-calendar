import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  OnInit
} from '@angular/core';
import { Observable } from 'rxjs';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CalendarEvent,
  CalendarView,
} from 'angular-calendar';

import { AppService } from './app.service'
import {
  IserverEvent,
  IrequestsObject
} from './app.interfaces'
import { format } from 'date-fns';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['app.component.css'],
  templateUrl: 'app.component.html',
  providers: [ NgbActiveModal ], 
})
export class AppComponent implements OnInit {

  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;
  @ViewChild('editModalContent', { static: true }) editModalContent: TemplateRef<any>
  events$: Observable<CalendarEvent<IserverEvent>[]>;
  eventsToday$: Observable<CalendarEvent<IserverEvent>[]>;
  requests$: Observable<IrequestsObject[]>;
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  modalData: { event: CalendarEvent };
  activeDayIsOpen: boolean = false;
  requestIndex = [];
  // for right sidebar
  formattedDate = format(new Date(), 'dd-EEEE-MMMM yyyy')?.toString()?.split('-')
  todayObj = {
    day: this.formattedDate[0],
    weekday: this.formattedDate[1],
    monthyear: this.formattedDate[2]
  }

  constructor(
    private activeModal: NgbActiveModal,
    private modal: NgbModal,
    private appService: AppService,
  ) {}

  ngOnInit(): void {
    this.events$ = this.appService.events
    this.requests$ = this.appService.requests
    this.eventsToday$ = this.appService.eventstoday
    this.appService.fetchAllEvents()
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.closeActiveModal()
    this.modalData = { event };
    this.activeModal = this.modal.open(this.modalContent, { size: 'md' });
    this.appService.fetchEventRequests(event?.id)
  }

  editModal(event: CalendarEvent): void {
    this.closeActiveModal()
    this.modalData = { event }
    this.activeModal = this.modal.open(this.editModalContent, { size: 'md' })
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
    this.closeActiveModal() // Close the modal after we get form element not before.

    const modified = {
      start: formDataJS.get('startdate'),
      end: formDataJS.get('enddate'),
      description: formDataJS.get('description')
    }

    if (modified.start !== prevData.start
      || modified.end !== prevData.end
      || modified.description !== prevData.description) {
        const updatedEvent: CalendarEvent = {...prevData, ...modified} 
        this.appService.updateEvent(updatedEvent)
      }
  }

  closeActiveModal() {
    this.activeModal && this.activeModal.close()
  }

  toggleRequest(i) {
    this.requestIndex[i] = !this.requestIndex[i]
  }

  showRequest(i) {
    return !!this.requestIndex[i]
  }

  showAllEvents() {
    this.view = CalendarView.Day
  }
}
