<!-- src/TimeOffTable.svelte -->
<script lang="ts">
    export let entries: TimeOffEntry[];
  
  type TimeOffEntry = {
    startDay: Date;
    endDay: Date;
    halfDay: boolean;
    status: 'Approved' | 'Denied' | 'Pending';
    type: 'Sick' | 'Vacation' | 'Other';
    description: string;
  };
  
    // Pagination state for Upcoming Table
    let currentPageUpcoming = 1;
    const entriesPerPage = 5;
    $: pageCountUpcoming = Math.ceil(upcomingEntries.length / entriesPerPage);
    $: startIndexUpcoming = (currentPageUpcoming - 1) * entriesPerPage;
    $: endIndexUpcoming = startIndexUpcoming + entriesPerPage;
    $: currentEntriesUpcoming = upcomingEntries.slice(startIndexUpcoming, endIndexUpcoming);
  
    // Pagination state for Past Table
    let currentPagePast = 1;
    $: pageCountPast = Math.ceil(pastEntries.length / entriesPerPage);
    $: startIndexPast = (currentPagePast - 1) * entriesPerPage;
    $: endIndexPast = startIndexPast + entriesPerPage;
    $: currentEntriesPast = pastEntries.slice(startIndexPast, endIndexPast);
  
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString();
    };
  
    const isUpcoming = (endDate: Date): boolean => {
      const today = new Date();
      return endDate >= today;
    };
  
    const isSingleDay = (startDate: Date, endDate: Date): boolean => {
      return startDate.toDateString() === endDate.toDateString();
    };
  
    const isHalfDay = (entry: TimeOffEntry): string => entry.halfDay ? ' (Half-Day)' : '';
  
    const getStatusClass = (status: string): string => {
      switch(status) {
        case 'Approved': return 'table-success';
        case 'Denied': return 'table-danger';
        case 'Pending': return 'table-warning';
        default: return '';
      }
    };
  
    // Split entries into upcoming and past
    $: upcomingEntries = entries.filter(entry => isUpcoming(entry.endDay));
    $: pastEntries = entries.filter(entry => !isUpcoming(entry.endDay));
  </script>
  
  <!-- Upcoming Time Off Table -->
  <div class="row align-items-center">
    <div class="col">
      <h2 class="py-3">Upcoming Time Off</h2>
    </div>
    <div class="col-auto">
      <!-- {#if pageCountUpcoming > 1}-->
      <div class="pagination">
        <div class="btn-group" role="group" aria-label="Basic example">
          <button type="button" class="btn btn-secondary" on:click={() => currentPageUpcoming = Math.max(currentPageUpcoming - 1, 1)} 
            disabled={currentPageUpcoming === 1}>Previous</button>
          <button type="button" class="btn btn-secondary" on:click={() => currentPageUpcoming = Math.min(currentPageUpcoming + 1, pageCountUpcoming)} 
            disabled={currentPageUpcoming === pageCountUpcoming}>Next</button>
        </div>
      </div>
    </div>
  </div>
  <table class="table">
    <thead>
      <tr>
        <th>Dates</th>
        <th>Type</th>
        <th>Description</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {#each currentEntriesUpcoming as entry}
        <tr class="{getStatusClass(entry.status)}">
          <td>
            {formatDate(entry.startDay)} 
            {#if !isSingleDay(entry.startDay, entry.endDay)}
              - {formatDate(entry.endDay)}
            {/if}
            {isHalfDay(entry)}
          </td>
          <td>{entry.type}</td>
          <td>{entry.description}</td>
          <td>{entry.status}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  
  <!-- Past Time Off Table -->
  <div class="row align-items-center">
    <div class="col">
      <h2 class="py-3">Past Time Off</h2>
    </div>
    <div class="col-auto">

      <div class="pagination">
        <div class="btn-group" role="group" aria-label="Basic example">
          <button type="button" class="btn btn-secondary" on:click={() => currentPagePast = Math.max(currentPagePast - 1, 1)} 
            disabled={currentPagePast === 1}>Previous</button>
          <button type="button" class="btn btn-secondary" on:click={() => currentPagePast = Math.min(currentPagePast + 1, pageCountPast)} 
            disabled={currentPagePast === pageCountPast}>Next</button>
        </div>
      </div>

    </div>
  </div>
  <table class="table">
    <thead>
      <tr>
        <th>Dates</th>
        <th>Type</th>
        <th>Description</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {#each currentEntriesPast as entry}
        <tr class="{getStatusClass(entry.status)}">
          <td>
            {formatDate(entry.startDay)} 
            {#if !isSingleDay(entry.startDay, entry.endDay)}
              - {formatDate(entry.endDay)}
            {/if}
            {isHalfDay(entry)}
          </td>
          <td>{entry.type}</td>
          <td>{entry.description}</td>
          <td>{entry.status}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  
  <style>
    .table-success {
      background-color: lightgreen;
    }
    .table-danger {
      background-color: red;
    }
    .table-warning {
      background-color: yellow;
    }
    .pagination {
      text-align: right;
      margin-top: 10px;
    }
  </style>
  