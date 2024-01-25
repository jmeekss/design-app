<script lang="ts">
    import NumberInputField from '../components/entryField.svelte';
    import RadioButtonSet from '../components/radioButtonSet.svelte';
    import SwitchField from '../components/switchBox.svelte';

    //Variables for including Forces
    let includeCurrent:boolean = true;
    let includeWind:boolean = false;
    let includeWave:boolean = false;
    let includeDebris:boolean = false;
    let includeWindIce:boolean = false;
    let includeCurrentIce:boolean = false;

    //Variables for Boom/Boomline Info
    let boomType: number;
    let boomDiameter: number;
    let includeScreen:boolean = false;
    let screenDepth: number;
    let boomCount: number;
    let boomLength: number;

    //Functions for Boom/Boomline
    function clearDepth() {
            screenDepth = 0;
    }

    function updateDiameter(){
        if(boomType == 1){
            boomDiameter = 0.41;
        } else if(boomType == 2){
            boomDiameter = 0.61;
        } else if(boomType == 3){
            boomDiameter = 0.91;
        } else if(boomType == 5){
            boomDiameter = 0.61;
        } else {
            boomDiameter = 0;
        }
    }

    //Variables for Segment 
    let segmentLength = 100; //number | undefined;
    let segmentAngle = 16; //number | undefined;
    let sagRatio = 15// number | undefined;

    //Functions for Segment


    //Variables for Forces
    let currentForce: number;
    let windForce: number;
    let waveForce: number;
    let debrisForce: number;
    let windIceForce: number;
    let currentIceForce: number;
    let totalForce: number;

    //Unit handling
    let isMetric: string = "true";
    let distanceUnit: string = "m";
    let forceUnit: string = "N";

    const handleUnitChange = (event: CustomEvent) => {
        isMetric = event.detail;
    };

    // Reactive statements
    $: distanceUnit = isMetric === "true" ? 'm' : 'ft';
    $: forceUnit = isMetric === "true" ? 'N' : 'lbs';

    function mMet(val:number, t:string){
        if(isMetric === "true"){
            return val;
        } else if(t === "d"){//distance (ft to m)
            return val / 3.281;
        } else if(t === "a"){//area (ft*ft to m*m)
            return val / (3.281 * 3.281);
        } else if(t === "f"){//force (lbs/ft to N/m)
            return val / 14.5938;
        } else if(t === "w"){//weight (lbs to N)
            return val / 4.448;
        }
        return val;
    }

    //Variables for Waves
    let wavesKnown:string = "true";
    let wavePeriod: number;
    let waveHeight: number;
    let upstreamFetch: number;
    let normalDepth: number;

    //Functions for Waves
    const handleWaveChange = (event: CustomEvent) => {
        wavesKnown = event.detail;
    };

    //Variables and Function for Planar Ice Area
    let planarIceKnown:string = "true";
    let planarIceArea: number;
    let riverWidth: number;

    function handleIceChange(event: CustomEvent) {
        planarIceKnown = event.detail;
    }

    function updateWaves() {
        if(!wavesKnown && upstreamFetch && normalDepth && waterVelocity){
            waveHeight = mMet(waterVelocity, "d")*mMet(waterVelocity, "d")*0.283*Math.tanh(0.530 * Math.pow((g*mMet(normalDepth, "d"))/(mMet(waterVelocity, "d")*mMet(waterVelocity, "d")),(3/4))) * Math.tanh((0.00565*Math.pow((g*mMet(upstreamFetch, "d"))/(mMet(waterVelocity, "d")*mMet(waterVelocity, "d")),(1/2)))/(Math.tanh(0.530*Math.pow((g*mMet(normalDepth, "d"))/(mMet(waterVelocity, "d")*mMet(waterVelocity, "d")),(3/4)))))/g;
            wavePeriod = mMet(waterVelocity, "d")*7.54*Math.tanh(0.833 * Math.pow((g*mMet(normalDepth, "d"))/(mMet(waterVelocity, "d")*mMet(waterVelocity, "d")),(3/8))) * Math.tanh((0.0379*Math.pow((g*mMet(upstreamFetch, "d"))/(mMet(waterVelocity, "d")*mMet(waterVelocity, "d")),(1/3)))/(Math.tanh(0.833*Math.pow((g*mMet(normalDepth, "d"))/(mMet(waterVelocity, "d")*mMet(waterVelocity, "d")),(3/8)))))/g;
        }
    }

    function updatePlanarIce() {
        if (!planarIceKnown && riverWidth !== undefined) {
            planarIceArea = riverWidth * riverWidth * 5;
        }
    }

    //Input Variables
    let waterVelocity: number;
    let windVelocity: number;
    let gustVelocity: number;
    let debrisBuildup: number;
    let iceBuildup: number;
    let depthBeneathDebris: number;
    let debrisDepth: number;
    let maxWaterVelocity: number;

    //Constants
    let g:number = 9.81; //gravity
    let waterDensity:number = 1000; //water density
    let waterUnitWeight:number = 9810; //unit weight of water
    let airDensity:number = 1.225; //air density
    let airUnitWeight:number = 12.67; //unit weight of air
    let RDSLWaterDrag:number = 1.25; //RDSL water drag coefficient
    let RDSLBoomDrag:number = 1.00; //RDSL boom drag coefficient
    let RDSLAirConstantIce:number = 0.003; //RDSL air constant for ice
    let RDSLWaterConstantIce:number = 0.015; //RDSL water constant for ice
    let n:number = 0.04125; //Manning number for debris
    let AES:number = 10; //AES standard wind measuring height

    function heightSubmerged(){
        let heightSubmerged:number = 0;

        //calculate depths under/above water
        if(boomDiameter > 0 && waterVelocity > 0){
            heightSubmerged = 0.2084*mMet(waterVelocity,"d")+0.0336;
            if(includeScreen && screenDepth > 0){
                heightSubmerged+=mMet(screenDepth,"d");
            }
        }

        return heightSubmerged;
    }

    function heightAbove(){
        let heightSubmerged:number | undefined;

        //calculate depths under/above water
        if(boomDiameter > 0 && waterVelocity >= 0){
            heightSubmerged = 0.2084*mMet(waterVelocity,"d")+0.0336;

            if(boomDiameter - heightSubmerged >0){
                return boomDiameter - heightSubmerged;
            } else {
                return 0;
            }
        }
    return 0;
    }

    //Reactive Current Force
    $: {
        if(includeCurrent && ((includeScreen && screenDepth >= 0) || !includeScreen) && boomDiameter > 0 && waterVelocity >= 0 && debrisDepth >= 0){
            let submerged:number = heightSubmerged();
            let wV:number = mMet(waterVelocity, "d");

            if(debrisDepth !== undefined && submerged < debrisDepth){
            submerged = debrisDepth;
            }

            currentForce = 0.5 * waterDensity * RDSLWaterDrag * submerged * mMet(waterVelocity,"d") * mMet(waterVelocity,"d");
        } else {
            currentForce = 0;
        }
    }

    //Reactive Wind Force
    $: {
        if(includeWind && ((includeScreen && screenDepth >= 0) || !includeScreen) && windVelocity >= 0 && waterVelocity >= 0){
            let wV:number = windVelocity;
            if(gustVelocity > windVelocity) wV = gustVelocity;
            windForce = 0.5 * airDensity * RDSLBoomDrag * heightAbove() * mMet(wV,"d") * mMet(wV,"d");
        } else {
            windForce = 0;
        }
    }

    //Reactive Wave Force
    $: {
        let inertiaCO:number = 2;
        let dragCO:number = 0.8;

        if(includeWave && waveHeight > 0 && wavePeriod > 0 && ((includeScreen && screenDepth >= 0) || !includeScreen) && waterVelocity >= 0){
            let submerged:number = heightSubmerged();
            let waveLength:number = (g*wavePeriod*wavePeriod)/(2*Math.PI);
            let particleVel:number = 0;
            let particleAcc:number = 0;

            let wH:number = mMet(waveHeight,"d");

            particleVel = Math.PI * (wH/wavePeriod) * Math.pow(Math.E, 2*Math.PI*(-0.5*submerged)/waveLength);
            particleAcc = 2*Math.PI*Math.PI * (wH/(wavePeriod*wavePeriod)) * Math.pow(Math.E, 2*Math.PI*(-0.5*submerged)/waveLength);

            waveForce = 0.5 * waterDensity * dragCO * submerged * particleVel * particleVel + waterDensity * inertiaCO * ((Math.PI * submerged * submerged)/(4))*particleAcc;
        } else {
            waveForce = 0;
        }
    }

    //Reactive Debris Force
    $: {
        if(includeDebris && ((includeScreen && screenDepth >= 0) || !includeScreen) && debrisDepth >= 0 && debrisBuildup >= 0 && waterVelocity >= 0 && depthBeneathDebris > 0 && windVelocity >= 0){
            let greaterDepth:number = heightSubmerged();
            let wV = mMet(windVelocity,"d");
            let watV = mMet(waterVelocity, "d");
            if(greaterDepth < mMet(debrisDepth,"d")) greaterDepth = mMet(debrisDepth,"d");

            if(gustVelocity > windVelocity) wV = mMet(gustVelocity,"d");

            let eqRoughness = 0.03 * 0.5 * greaterDepth;
            let debrisAccum:number = mMet(debrisBuildup,"d");

            debrisForce = (waterUnitWeight/g) * (watV*watV*n*n*debrisAccum)/(0.79*Math.pow(mMet(depthBeneathDebris,"d"),(1/3))) + (airUnitWeight/g) * (wV*wV*debrisAccum)/Math.pow((8.5+5.75*Math.log(AES/eqRoughness)),2);
        } else {
            //ERROR, MISSING VARIABLES
            debrisForce = 0;
        }
    }

    //Reactive Wind on Ice Force
    $: {
        if(planarIceArea > 0 && segmentLength > 0 && windVelocity >= 0){
            let wV = mMet(windVelocity,"d");
            if(gustVelocity !== undefined && gustVelocity > windVelocity) wV = mMet(gustVelocity,"d");

            windIceForce = airDensity * RDSLAirConstantIce * (mMet(planarIceArea, "a")/mMet(segmentLength,"d")) * wV * wV; 
        } else {
            windIceForce = 0;
        }
    }

    //Reactive Current on Ice Force
    $: {
        if(planarIceArea > 0 && segmentLength > 0 && waterVelocity >= 0){
            currentIceForce = waterDensity * RDSLWaterConstantIce * (mMet(planarIceArea, "a")/mMet(segmentLength,"d")) * mMet(waterVelocity,"d") * mMet(waterVelocity,"d"); 
        } else {
            currentIceForce = 0;
        }
    }


</script>

<body>
    {screenDepth}{includeScreen}
    <title>Design Calculator</title>
    <main style="padding:10px;">
        <form>
            <div class="row">
                <div class="col-6 col-md-6">
                    <!-- Force Selection Card-->
                    <div class="card w-100" style="height:315px; overflow-y: auto;">
                        <div class="card-header">
                            <div class="row align-items-center">
                                <div class="col">
                                    <h5 class="card-title">Forces to Include</h5>
                                </div>
                                <div class="col-auto">
                                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                        Help
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item">
                                <SwitchField id="currentDragSwitch" label="Current Drag" bind:checked={includeCurrent} disabled={true}/>
                            </li>
                            <li class="list-group-item">
                                <SwitchField id="windDragSwitch" label="Wind Drag" bind:checked={includeWind} disabled={false}/>
                            </li>
                            <li class="list-group-item">
                                <SwitchField id="waveDragSwitch" label="Wave Drag" bind:checked={includeWave} disabled={false}/>
                            </li>
                            <li class="list-group-item">
                                <SwitchField id="debrisDragSwitch" label="Debris Drag" bind:checked={includeDebris} disabled={false}/>
                            </li>
                            <li class="list-group-item">
                                <SwitchField id="windIceDragSwitch" label="Wind Drag on ice" bind:checked={includeWindIce} disabled={false}/>
                            </li>
                            <li class="list-group-item">
                                <SwitchField id="currentIceDragSwitch" label="Current Drag on Ice" bind:checked={includeCurrentIce} disabled={false}/>
                            </li>
                        </ul>
                    </div>

                    <!-- Boomline Information Card -->
                    <div class="card w-100" style="height:350px;margin:20px 0px 0px 0px; overflow-y: auto;">
                        <div class="card-header">
                            <div class="row align-items-center">
                                <div class="col">
                                    <h5 class="card-title">
                                        Boomline Information
                                    </h5>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <select
                                class="form-select"
                                aria-label="Default select example"
                                bind:value={boomType}
                                on:change={updateDiameter}
                                required
                            >
                                <option value="" selected disabled hidden>Select Boom Type</option>
                                <option value="1">Tuffboom</option>
                                <option value="2">Tuffboom XL</option>
                                <option value="3">BoatBuster</option>
                                <option value="4" hidden>BoatBuster HD</option>
                                <option value="5">ODINBoom</option>
                            </select>
                                <div class="row align-items-center">
                                    <div class="col-4">
                                        <div class="form-check">
                                            <input
                                                class="form-check-input"
                                                type="checkbox"
                                                id="autoSizingCheck"
                                                bind:checked={includeScreen}
                                                on:change={clearDepth}
                                            />
                                            <label
                                                class="form-check-label"
                                                for="autoSizingCheck"
                                            >
                                                Include Screen
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-8">
                                        <NumberInputField id="screenDepthInput" placeholder="Screen Depth" bind:value={screenDepth} unit={distanceUnit} required={includeScreen} min={0} disabled={!includeScreen}/>
                                    </div>
                                </div>
                            <NumberInputField id="boomCountInput" placeholder="Number of Booms" bind:value={boomCount} unit={"Booms"} required={true} min={0}/>
                            <NumberInputField id="boomLengthInput" placeholder="Boom Length" bind:value={boomLength} unit={distanceUnit} required={true} min={0}/>
                        </div>
                    </div>
                </div>

                <div class="col-6 col-md-6">
                    <!-- Needed Variables Card-->
                    <div class="card w-100" style="height: 685px; overflow-y: auto;">
                        <div class="card-header">
                            <div class="row align-items-center">
                                <div class="col">
                                    <h5 class="card-title">Needed Variables</h5>
                                </div>
                                <div class="col-md-4">
                                    <RadioButtonSet name="unitRadio"  selectedValue={isMetric} on:change={handleUnitChange} options={[{ id: 'metricRadio', label: 'Metric', value: "true" },{ id: 'impRadio', label: 'Imperial', value: "false" }]}/>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <NumberInputField id="waterVelocityInput" placeholder="Water Velocity" bind:value={waterVelocity} unit={distanceUnit+ "/s"} required={includeCurrent} hidden={!includeCurrent} min={0}/>
                            <NumberInputField id="debrisDepthInput" placeholder="Debris Depth" bind:value={debrisDepth} unit={distanceUnit} required={includeCurrent} hidden={!includeCurrent} min={0}/>
                            <NumberInputField id="windVelocityInput" placeholder="Wind Velocity" bind:value={windVelocity} unit={distanceUnit+ "/s"} required={includeWind || includeDebris || includeWindIce} hidden={!(includeWind || includeDebris || includeWindIce)} min={0}/>
                            <NumberInputField id="gustVelocityInput" placeholder="Gust Velocity" bind:value={gustVelocity} unit={distanceUnit+ "/s"} hidden={!(includeWind || includeDebris || includeWindIce)} min={0}/>
                            <RadioButtonSet name="waveRadio"  selectedValue={wavesKnown} on:change={handleWaveChange} options={[{ id: 'waveEntRadio', label: 'Enter Wave Period/Height', value: "true" },{ id: 'waveEstRadio', label: 'Estimate Wave Period/Height', value: "false" }]} hidden={!includeWave}/>
                            <NumberInputField id="wavePeriodInput" placeholder="Wave Period" bind:value={wavePeriod} unit={"s"} required={includeWave} hidden={!includeWave || !(wavesKnown==="true")} min={0}/>
                            <NumberInputField id="waveHeightInput" placeholder="Wave Height" bind:value={waveHeight} unit={distanceUnit} required={includeWave} hidden={!includeWave || !(wavesKnown==="true")} min={0}/>
                            <NumberInputField id="upstreamFetchInput" placeholder="Upstream Fetch" bind:value={upstreamFetch} unit={distanceUnit} required={!wavesKnown} hidden={!includeWave || (wavesKnown==="true")} min={0}/>
                            <NumberInputField id="normalDepthInput" placeholder="Normal Depth" bind:value={normalDepth} unit={distanceUnit} required={!wavesKnown} hidden={!includeWave || (wavesKnown==="true")} min={0}/>
                            <NumberInputField id="debrisBuildupInput" placeholder="Debris Buildup" bind:value={debrisBuildup} unit={distanceUnit+"²/"+distanceUnit} required={includeDebris} hidden={!includeDebris} min={0}/>
                            <NumberInputField id="depthBeneathDebrisInput" placeholder="Depth Beneath Debris" bind:value={depthBeneathDebris} unit={distanceUnit} required={includeDebris} hidden={!includeDebris} min={0}/>
                            <RadioButtonSet name="iceRadio"  selectedValue={planarIceKnown} on:change={handleIceChange} options={[{ id: 'iceEntRadio', label: 'Enter Planar Ice Area', value: "true" },{ id: 'iceEstRadio', label: 'Estimate Planar Ice Area', value: "false" }]} hidden={!(includeWindIce || includeCurrentIce)}/>
                            <NumberInputField id="planarIceInput" placeholder="Planar Ice Area" bind:value={planarIceArea} unit={distanceUnit+"²"} required={includeWindIce || includeCurrentIce} hidden={!(includeCurrentIce || includeWindIce)} disabled={!(planarIceKnown === "true")} min={0}/>
                            <NumberInputField id="riverWidthInput" placeholder="River Width" bind:value={riverWidth} unit={distanceUnit} required={(includeWindIce || includeCurrentIce) && !(planarIceKnown === "true")} hidden={!(includeCurrentIce || includeWindIce) || (planarIceKnown === "true")} min={0}/>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-3 col-md-6">
                    <!-- Summary of Unfactored Forces Card -->
                    <div class="card w-100" style="margin:10px;">
                        <div class="card-header">
                            <div class="row align-items-center">
                                <div class="col">
                                    <h5 class="card-title">
                                        Summary of Unfactored Forces
                                    </h5>
                                </div>
                            </div>
                        </div>
                        <div class="card-body" style="padding:10px;">
                            <NumberInputField id="currentDrag" placeholder="Current Drag Force" bind:value={currentForce} unit={forceUnit+"/"+distanceUnit} disabled={true}/>
                            <NumberInputField id="windDrag" placeholder="Wind Drag Force" bind:value={windForce} unit={forceUnit+"/"+distanceUnit} disabled={true}/>
                            <NumberInputField id="waveDrag" placeholder="Wave Drag Force" bind:value={waveForce} unit={forceUnit+"/"+distanceUnit} disabled={true}/>
                            <NumberInputField id="debrisDrag" placeholder="Debris Drag Force" bind:value={debrisForce} unit={forceUnit+"/"+distanceUnit} disabled={true}/>
                            <NumberInputField id="windIceDrag" placeholder="Wind Drag on Ice Force" bind:value={windIceForce} unit={forceUnit+"/"+distanceUnit} disabled={true}/>
                            <NumberInputField id="currentIceDrag" placeholder="Current Drag on Ice Force" bind:value={currentIceForce} unit={forceUnit+"/"+distanceUnit} disabled={true}/>
                        </div>
                    </div>
                </div>

                <div class="col-9 col-md-6">
                    <!-- Boom Segment Info Card -->
                    <div class="card w-100" style="margin:20px 0px 0px 0px;">
                        <div class="card-header">
                            <div class="row align-items-center">
                                <div class="col">
                                    <h5 class="card-title">
                                        Boom Segment Information
                                    </h5>
                                </div>
                            </div>
                        </div>
                        <div class="card-body" style="padding:10px;">
                            <NumberInputField id="segmentLengthInput" placeholder="Length of Segment" bind:value={segmentLength} unit={distanceUnit} required={true} min={0}/>
                            <NumberInputField id="segmentAngleInput" placeholder="Angle of Segment with Flow" bind:value={segmentAngle} unit={"degrees"} required={true} min={0} max={90}/>
                            <NumberInputField id="sagRatioInput" placeholder="Sag Ratio" bind:value={sagRatio} unit={"%"} required={true} min={0} max={100}/>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </main>
</body>

<!-- Force Help Modal -->
<div
    class="modal fade"
    id="exampleModal"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
>
    <div class="modal-dialog modal-lg">
        <!-- Use modal-lg for a larger modal if needed -->
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">
                    When to Include Each Force
                </h5>
                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                ></button>
            </div>
            <div class="modal-body">
                <!-- Nav tabs -->
                <ul class="nav nav-pills" id="myTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <a
                            class="nav-link active"
                            id="tab1-tab"
                            data-bs-toggle="tab"
                            href="#tab1"
                            role="tab"
                            aria-controls="tab1"
                            aria-selected="true">Current Drag</a
                        >
                    </li>
                    <li class="nav-item" role="presentation">
                        <a
                            class="nav-link"
                            id="tab2-tab"
                            data-bs-toggle="tab"
                            href="#tab2"
                            role="tab"
                            aria-controls="tab2"
                            aria-selected="false">Wind Drag</a
                        >
                    </li>
                    <li class="nav-item" role="presentation">
                        <a
                            class="nav-link"
                            id="tab3-tab"
                            data-bs-toggle="tab"
                            href="#tab3"
                            role="tab"
                            aria-controls="tab3"
                            aria-selected="false">Wave Drag</a
                        >
                    </li>
                    <li class="nav-item" role="presentation">
                        <a
                            class="nav-link"
                            id="tab4-tab"
                            data-bs-toggle="tab"
                            href="#tab4"
                            role="tab"
                            aria-controls="tab4"
                            aria-selected="false">Debris Drag</a
                        >
                    </li>
                    <li class="nav-item" role="presentation">
                        <a
                            class="nav-link"
                            id="tab5-tab"
                            data-bs-toggle="tab"
                            href="#tab5"
                            role="tab"
                            aria-controls="tab5"
                            aria-selected="false">Wind Drag on Ice</a
                        >
                    </li>
                    <li class="nav-item" role="presentation">
                        <a
                            class="nav-link"
                            id="tab6-tab"
                            data-bs-toggle="tab"
                            href="#tab6"
                            role="tab"
                            aria-controls="tab6"
                            aria-selected="false">Current Drag on Ice</a
                        >
                    </li>
                </ul>

                <!-- Tab content -->
                <div class="tab-content" id="myTabsContent">
                    <div
                        class="tab-pane fade show active"
                        id="tab1"
                        role="tabpanel"
                        aria-labelledby="tab1-tab"
                    >
                        <br />
                        <h4>Description</h4>
                        The force exerted by moving water against the boom. It's
                        influenced by the water's velocity, the submerged area of
                        the boom, and the drag coefficient.<br /><br />
                        <h4>When to Include</h4>
                        Vital in all waterway settings, particularly in flowing rivers
                        or streams.<br /><br />
                        <h4>Examples</h4>
                        <strong>Include</strong> in a river with steady flow,
                        where the current exerts constant force on the boom.<br
                        />
                        <strong>Exclude</strong> in stagnant water bodies like small
                        ponds where water flow is negligible or absent.
                    </div>
                    <div
                        class="tab-pane fade"
                        id="tab2"
                        role="tabpanel"
                        aria-labelledby="tab2-tab"
                    >
                        <br />
                        <h4>Description</h4>
                        The force exerted by the wind on the portion of the boom
                        that is above water. It depends on wind speed, the exposed
                        surface area of the boom, and the drag coefficient.<br
                        /><br />
                        <h4>When to Include</h4>
                        Important in open and exposed areas where wind can significantly
                        impact the boom's position or create additional stress on
                        its anchoring system.<br /><br />
                        <h4>Examples</h4>
                        <strong>Include</strong> in open lakes or coastal areas
                        where strong winds can push the boom and cause it to
                        move or strain its anchors.<br />
                        <strong>Exclude</strong> in sheltered or narrow channels
                        where surrounding structures or natural features significantly
                        reduce wind impact.
                    </div>
                    <div
                        class="tab-pane fade"
                        id="tab3"
                        role="tabpanel"
                        aria-labelledby="tab3-tab"
                    >
                        <br />
                        <h4>Description</h4>
                        The force exerted by waves, combining both the drag force
                        due to wave particle velocity and the inertia force due to
                        wave particle acceleration. It's influenced by wave height,
                        period, and water depth.<br /><br />
                        <h4>When to Include</h4>
                        Crucial in coastal areas or large lakes where waves are prevalent,
                        impacting the stability and effectiveness of the boom.<br
                        /><br />
                        <h4>Examples</h4>
                        <strong>Include</strong> in coastal areas where regular
                        wave action can impose dynamic loads on the boom.<br />
                        <strong>Exclude</strong> in enclosed water bodies like small
                        ponds or reservoirs where wave action is minimal or nonexistent.
                    </div>
                    <div
                        class="tab-pane fade"
                        id="tab4"
                        role="tabpanel"
                        aria-labelledby="tab4-tab"
                    >
                        <br />
                        <h4>Description</h4>
                        The resistance caused by debris accumulation against the
                        boom. It involves the frictional force between the debris
                        and the water, as well as the debris and the air.<br
                        /><br />
                        <h4>When to Include</h4>
                        Important in areas known for significant debris presence,
                        which can exert additional loads and potentially clog or
                        damage the boom.<br /><br />
                        <h4>Examples</h4>
                        <strong>Include</strong> in areas near urban runoff or
                        downstream from industrial sites where debris
                        accumulation is common.<br />
                        <strong>Exclude</strong> in clean, managed waterways where
                        debris is regularly removed and does not pose a significant
                        risk.
                    </div>
                    <div
                        class="tab-pane fade"
                        id="tab5"
                        role="tabpanel"
                        aria-labelledby="tab5-tab"
                    >
                        <br />
                        <h4>Description</h4>
                        The force exerted by wind on ice formations that may be present
                        around the boom. It's a factor of wind speed, ice surface
                        area, and a drag coefficient.<br /><br />
                        <h4>When to Include</h4>
                        Relevant in cold climates where ice formation is a concern,
                        as ice can add significant load and impact the boom's performance
                        and structural integrity.<br /><br />
                        <h4>Examples</h4>
                        <strong>Include</strong> in northern climates where
                        freezing temperatures lead to ice formation on the water
                        surface. <br />
                        <strong>Exclude</strong> in tropical or temperate regions
                        where ice formation is not a concern.
                    </div>
                    <div
                        class="tab-pane fade"
                        id="tab6"
                        role="tabpanel"
                        aria-labelledby="tab6-tab"
                    >
                        <br />
                        <h4>Description</h4>
                        The drag force exerted by water currents on submerged ice,
                        which can be attached to or impede the boom. It's based on
                        water velocity, the submerged ice surface area, and drag
                        coefficient.<br /><br />
                        <h4>When to Include</h4>
                        Necessary to consider in freezing conditions where ice flow
                        can exert pressure on the boom, potentially leading to structural
                        stress or displacement.<br /><br />
                        <h4>Examples</h4>
                        <strong>Include</strong> in areas with cold winters
                        where ice flows can drag against the boom and cause
                        additional strain.<br />
                        <strong>Exclude</strong> in regions where the temperature
                        does not drop below freezing, making ice flow against the
                        boom unlikely.
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
</style>
