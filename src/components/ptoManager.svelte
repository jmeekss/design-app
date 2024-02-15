<script lang="ts">
  import PTOStats from './PTOStats.svelte';
  import ModalRequestPTO from './modalRequestPTO.svelte';
  import PTOCalendar from './PTOCalendar.svelte';
  import TimeOffTable from './TimeOffTable.svelte';
  import PocketBase from 'pocketbase';
  import { onMount } from 'svelte';

  const pb = new PocketBase('http://127.0.0.1:8090');

    let awardedDays = 10;
    let bonusDays = 5;
    let usedDays = 2;
    let remainingDays = 13;
    let waitingApprovalDays = 5;
    let approvedTakenDays = 2;
    let approvedNotTakenDays = 0;
    let userID = "1gtph4f68lrpg4h";

const nationalHolidays = [
  { date: new Date(2024, 0, 1), name: "New Year's Day" }, 
  { date: new Date(2024, 6, 4), name: "Independence Day" },
  { date: new Date(2024, 11, 25), name: "Christmas Day" }
];

  type TimeOffEntry = {
    startDay: Date;
    endDay: Date;
    halfDay: boolean;
    status: 'Approved' | 'Denied' | 'Pending';
    type: 'Sick' | 'Vacation' | 'Other';
    description: string;
  };

  let timeOffEntries: TimeOffEntry[] = [];

  async function fetchTimeOffData() {
    const authData = await pb.collection('users').authWithPassword(
    'jmeeks@tuffboom.com',
    '12345678',
    );


    try {

      const { items } = await pb.collection('timeOff').getList(1, 50, {
        filter: `user = "${pb.authStore.model.id}"`,

        sort: '-startDay',
      });

      timeOffEntries = items.map((item: any) => ({
        startDay: new Date(item.startDay),
        endDay: new Date(item.endDay),
        halfDay: item.halfDay,
        status: item.status,
        type: item.type,
        description: item.description,
      }));
    } catch (error) {
      console.error('Error fetching time off data:', error);
    }
  }

  onMount(() => {
    fetchTimeOffData();
  });

</script>

<title>Time-Off</title>

<main class="p-3 container-sm">
  <div class="row align-items-center">
    <div class="col">
      <h2 class="py-3">Time-Off Manager</h2>
    </div>
    <div class="col-auto">
      <ModalRequestPTO />
    </div>
  </div>

  <PTOStats 
    awardedDays={awardedDays} 
    bonusDays={bonusDays} 
    usedDays={usedDays} 
    remainingDays={remainingDays} 
    waitingApprovalDays={waitingApprovalDays}  
    approvedTakenDays={approvedTakenDays} 
    approvedNotTakenDays={approvedNotTakenDays}
  />

  <TimeOffTable entries={timeOffEntries}/>

  <PTOCalendar entries={timeOffEntries} nationalHolidays={nationalHolidays}/>
</main>