<script lang="ts" setup>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
//import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction'
const route = useRoute()
//const authState = useAuthState()
const { data: authState}: { data: any } = useSession()
const adminMode = ref(authState.value.user.roles.includes('Admin'))
const fullCalendar:any = ref<InstanceType<typeof FullCalendar>>()
const calendarApi = ref()
onMounted(async ()=>{
    calendarApi.value = fullCalendar.value.getApi()
})
const calendarOptions = reactive({
        plugins: [ dayGridPlugin, listPlugin, interactionPlugin ],
        initialView: 'dayGridMonth',
        height: "auto",
        //contentHeight: "100%",
        selectable: false,
        //aspectRatio: 2.4,
        //locale: plLocale,
        weekNumbers: true,
        weekends: false,
        expandRows: true,
        //slotDuration: '00:30:00',
        displayEventTime: true,
        displayEventEnd: true,
        //navLinks: true,
        // slotMinTime: "07:00:00",
        // slotMaxTime: "17:00:00",
        headerToolbar: {
            left: 'prev,next today newEvent refresh',
            center: 'title',
            right: 'dayGridMonth,listWeek'
        },
        // views: {
        //     timeGridCustom: {
        //         type: 'timeGridWeek',
        //         displayEventTime: false,
        //         displayEventEnd: false
        //     }
        // },
        customButtons: {
            newEvent: {
                text: 'New Absence',
                click: ()=>{
                    navigateTo('/absences')
                }
            },
            refresh: {
                text: 'Reload',
                click: ()=>{
                    calendarApi.value.refetchEvents()
                }
            },
        },
        eventClick: (info)=> {
            navigateTo('/absences/'+info.event.id)
        },
        events: async (info, successCallback, failureCallback)=>{
            try{
                let events = await $fetch('/api/absences', { params: { 
                        from: info.start.toISOString(),
                        to: info.end.toISOString()
                    } 
                })
                events = events.map(x=>{
                    let end = new Date(x.to)
                    end.setDate(end.getDate() + 1)
                    return {
                      title: x.user.name+" -> "+x.deputy.name,
                      start: new Date(x.from),
                      end,
                      allDay: true,
                      id: x.id,
                      backgroundColor: route.params.id == x.id ?"#2e4242":undefined
                }})
                console.log(events)
                successCallback(events)
            }catch(err){
                console.log(err)
                failureCallback(failureCallback)
            }
        }
    })
</script>


<template>
<div>
    <a-card title="Absence calendar">
        <template #extra >
            <FormAbsence :eventId="parseInt(route.params.id)"/>
        </template>
        <FullCalendar ref="fullCalendar" :options="calendarOptions" />
    </a-card>
</div>
</template>