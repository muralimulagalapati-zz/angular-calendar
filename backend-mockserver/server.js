const express = require("express")
const cors = require('cors')
const bodyParser = require('body-parser')
const {
  startOfDay,
  subDays,
  addDays,
  endOfMonth,
  addHours,
} = require('date-fns')

const app = express()
app.use(cors())
app.use(bodyParser.json())
const colors = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

const requests = [
  {
    name: 'Request 1',
    description: 'Request 1 description',
    id: 321,
    scheduleid: 1
  },
  {
    name: 'Request 2',
    description: 'Request 2 description',
    id: 322,
    scheduleid: 1
  }
]

const schedules = [
  {
    id: 2,
    start: subDays(startOfDay(new Date()), 1),
    end: addDays(new Date(), 1),
    title: 'A 3 day event',
    color: colors.red,
    textColor: 'white',
    actions: this.actions,
    allDay: true,
    resizable: {
      beforeStart: true,
      afterEnd: true,
    },
  },
  {
    id: 1,
    start: startOfDay(new Date()),
    end: addHours(new Date(), 2),
    cssClass: 'cal-day-cell.cal-today',
    title: 'A sample event',
    color: colors.yellow,
    textColor: 'black',
    actions: this.actions,
    facility: 'DC-USW',
    eventType: 'monthly',
    description: 'A sample event description',
    recurrence: 'Occurs every wednesday of first week of month'
  },
  {
    id: 3,
    start: subDays(endOfMonth(new Date()), 3),
    end: addDays(endOfMonth(new Date()), 3),
    title: 'A long event that spans 2 months',
    color: colors.blue,
    textColor: 'white',
    allDay: true,
  },
  {
    id: 4,
    start: addHours(startOfDay(new Date()), 2),
    end: addHours(new Date(), 2),
    title: 'A draggable and resizable event',
    textColor: 'black',
    color: colors.yellow,
    actions: this.actions,
    resizable: {
      beforeStart: true,
      afterEnd: true,
    },
  },
];

app.get('/requests/:scheduleid', (req, res) => {
  const { scheduleid } = req.params
  res.status(200).json({
    results: requests.filter(s => s.scheduleid == scheduleid)
  })
})

app.get('/scheduler', (_, res) => {
  res.status(200).json({
    results: schedules
  })
})

app.patch('/scheduler/:id', (req, res) => {
  const { id } = req.params
  const modifiedEvent = req.body.event
  const index = schedules.findIndex(event => id == event.id)
  try {
    if (index !== -1) {
      schedules[index] = modifiedEvent
      res.sendStatus(200)
    } else {
      res.sendStatus(404)
    }
  } catch (ex) {
    console.error(ex)
    res.sendStatus(500)
  }
})

app.get('/ping', (req, res) => {
  res.status(200).send('OK')
})

app.listen(3000, () => console.log('Server is listening'))
