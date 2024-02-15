<script lang="ts">
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    type TimeOffEntry = {
    startDay: Date;
    endDay: Date;
    halfDay: boolean;
    status: 'Approved' | 'Denied' | 'Pending';
    type: 'Sick' | 'Vacation' | 'Other';
    description: string;
  };

    export let entries: TimeOffEntry[];
    export let nationalHolidays: { date: Date, name: string }[] = [];

    let today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    let calendarDates = writable<Date[]>([]);

    const generateCalendar = (month: number, year: number) => {
        const result: Date[] = [];
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Start the calendar at the previous Sunday (if not already a Sunday)
        let day = firstDay;
        day.setDate(day.getDate() - day.getDay());

        // Fill in until the next Saturday (if not already a Saturday)
        while (day <= lastDay || day.getDay() !== 0) {
            result.push(new Date(day));
            day.setDate(day.getDate() + 1);
        }

        calendarDates.set(result);
    };

    const navigateMonth = (direction: number) => {
        currentMonth += direction;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        } else if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentMonth, currentYear);
    };

    const formatDate = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

    const findEntryForDate = (date: Date) => entries.find(entry =>
        formatDate(date) >= formatDate(entry.startDay) && formatDate(date) <= formatDate(entry.endDay)
    );

    const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

    const isNationalHoliday = (date: Date) => nationalHolidays.some(holiday =>
        formatDate(date) === formatDate(holiday.date)
    );

    const getStatusColor = (status: string, date: Date) => {
        if (isWeekend(date) || isNationalHoliday(date)) return 'Gainsboro';
        switch (status) {
            case 'Approved': return 'lightgreen';
            case 'Pending': return '#FFFF99';
            case 'Denied': return '#FF6666';
            default: return 'none';
        }
    };

    onMount(() => {
        generateCalendar(currentMonth, currentYear);
    });
</script>

<style>
    .calendar {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 10px;
    }
    .day {
        padding: 10px;
        border: 1px solid #ccc;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .navigation {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
    }
</style>
<h2 class="py-3">Time-Off Calendar</h2>
<div class="navigation">
    <button class="btn btn-secondary" on:click={() => navigateMonth(-1)}>Previous Month</button>
    <strong>{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</strong>
    <button class="btn btn-secondary" on:click={() => navigateMonth(1)}>Next Month</button>
</div>

<div class="calendar">
    {#each $calendarDates as day}
        <div class="day" style="background-color: {findEntryForDate(day) ? getStatusColor(findEntryForDate(day).status, day) : isWeekend(day) || isNationalHoliday(day) ? 'Gainsboro' : 'white'}">
            {day.getMonth() === currentMonth ? 
                `${day.getDate()}
                ${isNationalHoliday(day) ? `${nationalHolidays.find(holiday => formatDate(day) === formatDate(holiday.date)).name}` : ''}
                ${findEntryForDate(day) ? `${findEntryForDate(day).type}` : ''}` : ''}
        </div>
    {/each}
</div>
