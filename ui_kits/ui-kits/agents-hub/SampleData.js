// Agents Hub — sample data for the 5 agents. Realistic shape
// matching the SharePoint Issue Tracker columns.

const AGENT_TICKETS = {
  matthew: [
    {num:'710147', time:'12:42 PM', created:'2026-05-15 12:42', name:'Funmilayo Okeke',
     phone:'+2348144210987', meter:'43901607762', addr:'14 Ekololu Street, Surulere',
     bu:'MUSHIN', issue:'Faulty meter — display blank, no supply for 2 days',
     category:'METERING / METER NOT SUPPLYING',
     resp:'Holyland Umude', status:'unresolved', note:'Awaiting BU survey · escalated to PPM team.'},
    {num:'710171', time:'1:08 PM', created:'2026-05-16 13:08', name:'Damilare Adeniran',
     phone:'+2348023445166', meter:'213242018389', addr:'45B Udi Avenue, Victory Estate, Ajah',
     bu:'AJAH', issue:'Estimated bill query — ₦42k disputed',
     category:'BILLING / OVER BILLING',
     resp:'Mojibola Adefuwa', status:'resolved', note:'Adjusted to actual reading · customer confirmed.'},
  ],
  racheal: [
    {num:'710162', time:'12:58 PM', created:'2026-05-13 12:58', name:'Bidemi Akande',
     phone:'+2347016574421', meter:'45046784349', addr:'12B Bishop Howells St, Ikoyi',
     bu:'IKOYI', issue:'Low voltage 3 of 3 phases since last night',
     category:'INTERRUPTION / VOLTAGE',
     resp:'Ogheneyoreme Agbroko', status:'progress', note:'TX loading check scheduled · feeder team enroute.'},
    {num:'710195', time:'1:36 PM', created:'2026-05-17 13:36', name:'Eze Chukwu',
     phone:'+2348131526803', meter:'54300001390', addr:'34B Olayinka Street, Itire, Mushin',
     bu:'MUSHIN', issue:'Unable to load tokens — display rejects',
     category:'METERING / UNABLE TO LOAD',
     resp:'Holyland Umude', status:'resolved', note:'Cleared on next vend · customer confirmed.'},
    {num:'710207', time:'1:51 PM', created:'2026-05-10 13:51', name:'Kunle Adetayo',
     phone:'+2347012112345', meter:'125251179433', addr:'25 Airways Road, Ijeshatedo',
     bu:'LEKKI', issue:'Outage 30+ mins · whole street affected',
     category:'INTERRUPTION / PLANNED/UNPLANNED OUTAGE',
     resp:'Ogheneyoreme Agbroko', status:'unresolved', note:'Pending feeder restoration · 2nd escalation.'},
  ],
  tomina: [
    {num:'710188', time:'1:24 PM', created:'2026-05-09 13:24', name:'Aisha Bello',
     phone:'+2348022912717', meter:'43901959114', addr:'House 3, Block A, Emerald Court, 17 Adeniyi Coker St, VI',
     bu:'AJAH', issue:'Change of name on prepaid meter',
     category:'METERING / WRONG DETAILS ON INSTALLATION FORM',
     resp:'Adetoun Adetola', status:'progress', note:'Documents received · pending finance review.'},
  ],
  esther: [
    {num:'710218', time:'1:58 PM', created:'2026-05-17 13:58', name:'Tope Oluwa',
     phone:'+2348144210987', meter:'4156158646', addr:'Block 3, Bar Beach Towers, Victoria Island',
     bu:'IKOYI', issue:'Wrong tariff — Band A applied, should be Band B',
     category:'BAND RECLASSIFICATION / WRONG BAND',
     resp:'Nonye Angelina Nnadozie', status:'progress', note:'Mapping request sent · awaiting confirmation.'},
  ],
  loveth: [
    {num:'710238', time:'8:17 AM', created:'2026-05-17 08:17', name:'Gabriel Asiegbu',
     phone:'+2347035122244', meter:'213240264258', addr:'Plot AV 15 Road 252 Festac Phase 2, Abule Ado',
     bu:'FESTAC', issue:'No power supply since 28 April',
     category:'INTERRUPTION / PLANNED/UNPLANNED OUTAGE',
     resp:'Ogheneyoreme Agbroko', status:'resolved', note:'Issue resolved · customer confirmed.'},
    {num:'710260', time:'9:16 AM', created:'2026-05-17 09:16', name:'Aniekan Akpabot',
     phone:'+2348033197473', meter:'45046784349', addr:'6 Hameed Bello Close, Isashi',
     bu:'OJO', issue:'Fallen/tilted pole — no power since 28 April',
     category:'INTERRUPTION / FALLEN/TILTED POLE',
     resp:'Ogheneyoreme Agbroko', status:'resolved', note:'Poles erected · power restored.'},
  ],
};

if (typeof window !== 'undefined') window.AGENT_TICKETS = AGENT_TICKETS;
