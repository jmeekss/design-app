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
    let segmentLength: number;
    let segmentAngle: number;
    let sagRatio: number;

    //Functions for Segment


    //Variables for Forces
    let currentForce: number = 0;
    let windForce: number = 0;
    let waveForce: number = 0;
    let debrisForce: number = 0;
    let windIceForce: number = 0;
    let currentIceForce: number = 0;
    let unfactoredForce: number = 0;
    let equivalentForce: number = 0;
    let boomFaceForce: number = 0;

    //Variables for Segment Load Summary
    let length90Current:number;
    let horizontalLoad:number[] = [0, 0];
    let maxTension1:number[] = [0, 0];
    let maxTension2:number[] = [0, 0];
    let verticalLoad1:number[] = [0, 0];
    let verticalLoad2:number[] = [0, 0];


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

    //Variables and Functions for Waves
    let wavesKnown:string = "true";

    const handleWaveChange = (event: CustomEvent) => {
        wavesKnown = event.detail;
    };

    function getWaveHeight() {
        if(wavesKnown === "true" && waveHeight >= 0){
            return mMet(waveHeight, "d");
        } else if(upstreamFetch && normalDepth && windVelocity){
            let windVelocityMetric = 0.71 * Math.pow(mMet(windVelocity, "d"), 1.23);
            let normalDepthMetric = mMet(normalDepth, "d");
            let fetchMetric = mMet(upstreamFetch, "d");
            waveHeight = windVelocityMetric*windVelocityMetric*0.283*Math.tanh(0.530 * Math.pow(g * normalDepthMetric / (windVelocityMetric * windVelocityMetric), 3 / 4)) * Math.tanh((0.00565*Math.pow((g*fetchMetric)/(windVelocityMetric*windVelocityMetric),(1/2)))/Math.tanh(0.530 * Math.pow(g * normalDepthMetric/ (windVelocityMetric * windVelocityMetric),3/4))) / g;
            return waveHeight;
            wavePeriod = windVelocityMetric*7.54*Math.tanh(0.833 * Math.pow((g*normalDepthMetric)/(windVelocityMetric*windVelocityMetric),(3/8))) * Math.tanh((0.0379*Math.pow((g*fetchMetric)/(windVelocityMetric*windVelocityMetric),(1/3)))/(Math.tanh(0.833*Math.pow((g*normalDepthMetric)/(windVelocityMetric*windVelocityMetric),(3/8)))))/g;
        }
        return -1;
    }

    function getWavePeriod() {
        if(wavesKnown === "true" && wavePeriod >= 0){
            return wavePeriod;
        } else if(upstreamFetch && normalDepth && windVelocity){
            let windVelocityMetric = 0.71 * Math.pow(mMet(windVelocity, "d"), 1.23);
            let normalDepthMetric = mMet(normalDepth, "d");
            let fetchMetric = mMet(upstreamFetch, "d");
            wavePeriod = windVelocityMetric*7.54*Math.tanh(0.833 * Math.pow((g*normalDepthMetric)/(windVelocityMetric*windVelocityMetric),(3/8))) * Math.tanh((0.0379*Math.pow((g*fetchMetric)/(windVelocityMetric*windVelocityMetric),(1/3)))/(Math.tanh(0.833*Math.pow((g*normalDepthMetric)/(windVelocityMetric*windVelocityMetric),(3/8)))))/g;
            return wavePeriod;
        }
        return -1;
    }

    //Variables and functions for planar ice area
    let planarIceKnown:string = "true";
    function handleIceChange(event: CustomEvent) {
        planarIceKnown = event.detail;
    }
    function updatePlanarIce() {
        if (!planarIceKnown && riverWidth > 0) {
            planarIceArea = riverWidth * riverWidth * 5;
        }
    }

    //Variables and functions for selecting force result
    let isTotalForce:string = "true";
    function handleForceChange(event: CustomEvent) {
        isTotalForce = event.detail;
    }

    //Input Variables
    let waterVelocity: number;
    let windVelocity: number;
    let gustVelocity: number;
    let debrisBuildup: number;
    let iceBuildup: number = 0;
    let depthBeneathDebris: number;
    let debrisDepth: number;
    let wavePeriod: number;
    let waveHeight: number;
    let upstreamFetch: number;
    let normalDepth: number;
    let planarIceArea: number;
    let riverWidth: number;
    let maxWaterVelocity: number;
    let inertiaCO:number = 2; //CAN BE CALCULATED
    let dragCO:number = 0.8; //CAN BE CALCULATED

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

    //Calculate height of boom below water at a given velocity (including screen)
    function heightSubmerged(){
        let heightSubmerged:number = 0;

        if(boomDiameter > 0 && waterVelocity > 0){
            heightSubmerged = 0.2084*mMet(waterVelocity,"d")+0.0336;
            if(includeScreen && screenDepth > 0){
                heightSubmerged+=mMet(screenDepth,"d");
            }
        }

        return heightSubmerged;
    }

    //Calculate height of boom above water at given velocity
    function heightAbove(){
        let heightSubmerged:number | undefined;

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

    function displayVal(val:number, conv:number){
        if(isMetric === "true" && val){
            return parseFloat((val).toFixed(2));
        } else if(isMetric === "false"){
            return parseFloat((val*conv).toFixed(2));
        } 
        return 0;
    }

    let validCalc:boolean = false;
    
    function calculateForces(){
        validCalc = false;
        currentForce = calcCurrent(heightSubmerged(), mMet(waterVelocity, "d"), mMet(debrisDepth, "d"));
        windForce = calcWind(heightAbove(), mMet(windVelocity, "d") < mMet(gustVelocity, "d") ? mMet(gustVelocity, "d") : mMet(windVelocity, "d"), mMet(waterVelocity, "d"));
        waveForce = calcWave(getWaveHeight(), getWavePeriod(), mMet(waterVelocity, "d"), heightSubmerged() < mMet(debrisDepth, "d") ? mMet(debrisDepth, "d") : heightSubmerged());
        debrisForce = calcDebris(heightSubmerged() < mMet(debrisDepth, "d") ? mMet(debrisDepth, "d") : heightSubmerged(), mMet(windVelocity, "d") < mMet(gustVelocity, "d") ? mMet(gustVelocity, "d") : mMet(windVelocity, "d"), mMet(waterVelocity, "d"), mMet(debrisBuildup, "d"));
        windIceForce = calcWindIce(mMet(windVelocity, "d") < mMet(gustVelocity, "d") ? mMet(gustVelocity, "d") : mMet(windVelocity, "d"), mMet(planarIceArea, "a"), mMet(segmentLength, "d"));
        currentIceForce = calcCurrentIce(mMet(waterVelocity, "d"), mMet(planarIceArea, "a"), mMet(segmentLength, "d"));

        if(currentForce === -1 || windForce === -1 || waveForce === -1 || debrisForce === -1 || windIceForce === -1 || currentIceForce === -1){
            validCalc = false;
        } else {

            unfactoredForce = currentForce + waveForce + windForce + debrisForce + windIceForce + currentIceForce;

            equivalentForce = unfactoredForce * boomCount * mMet(boomLength, "d");

            length90Current = mMet(segmentLength, "d") * Math.cos(segmentAngle*Math.PI/180);

            if(length90Current == 0){
                boomFaceForce = equivalentForce;
            } else {
                boomFaceForce = equivalentForce / length90Current;
            }

            horizontalLoad[0] = calcHorizontalLoad(unfactoredForce, length90Current, sagRatio);
            horizontalLoad[1] = calcHorizontalLoad(boomFaceForce, length90Current, sagRatio);
            verticalLoad1[0] = calcVerticalLoad(unfactoredForce, 0, horizontalLoad[0], segmentAngle*Math.PI/180, length90Current);
            verticalLoad1[1] = calcVerticalLoad(boomFaceForce, 0, horizontalLoad[1], segmentAngle*Math.PI/180, length90Current);
            verticalLoad2[0] = calcVerticalLoad(unfactoredForce, length90Current, horizontalLoad[0], segmentAngle*Math.PI/180, length90Current);
            verticalLoad2[1] = calcVerticalLoad(boomFaceForce, length90Current, horizontalLoad[1], segmentAngle*Math.PI/180, length90Current);
            maxTension1[0] = calcTension(verticalLoad1[0], horizontalLoad[0]);
            maxTension1[1] = calcTension(verticalLoad1[1], horizontalLoad[1]);
            maxTension2[0] = calcTension(verticalLoad2[0], horizontalLoad[0]);
            maxTension2[1] = calcTension(verticalLoad2[1], horizontalLoad[1]);

            if(horizontalLoad[0] === -1 || verticalLoad1[0] === -1 || verticalLoad2[0] === -1 || maxTension1[0] === -1 || maxTension2[0] === -1){
                validCalc = false;
            } else {
                validCalc = true;
                const resultsBox = document.getElementById('resultsBox');
                if (resultsBox) {
                    resultsBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }
    }

    function calcCurrent(depthUnderwaterMetric:number, waterVelocityMetric:number, debrisDepthMetric:number){
        if(includeCurrent){
            if(depthUnderwaterMetric >= 0 && waterVelocityMetric >= 0 && debrisDepthMetric >= 0){

                if(depthUnderwaterMetric < debrisDepthMetric) depthUnderwaterMetric = debrisDepthMetric;

                return 0.5 * waterDensity * RDSLWaterDrag * depthUnderwaterMetric * waterVelocityMetric * waterVelocityMetric;
            } else {
                return -1;
            }
        }
        return 0;
    }
    function calcWind(heightAboveWaterMetric:number, windVelocityMetric:number, waterVelocityMetric:number){
        if(includeWind){
            if(heightAboveWaterMetric >= 0 && windVelocityMetric >= 0 && waterVelocityMetric >= 0){
                return 0.5 * airDensity * RDSLBoomDrag * heightAboveWaterMetric * windVelocityMetric * windVelocityMetric;
            } else {
                return -1;
            }
        }
        return 0;
    }
    function calcWave(waveHeightMetric:number, wavePd:number, waterVelocityMetric:number, depthUnderwaterMetric:number){
        if(includeWave){
            if(waveHeightMetric >= 0 && wavePd > 0 && waterVelocityMetric >= 0 && depthUnderwaterMetric >= 0){
                let waveLengthMetric:number = (g*wavePeriod*wavePeriod)/(2*Math.PI);

                if(waveLengthMetric == 0){
                    waveForce = -1;
                    return 0;
                }

                let particleVelocity:number = Math.PI * (waveHeightMetric/wavePd) * Math.pow(Math.E, 2*Math.PI*(-0.5*depthUnderwaterMetric)/waveLengthMetric);
                let particleAcceleration:number = 2*Math.PI*Math.PI * (waveHeightMetric/(wavePd*wavePd)) * Math.pow(Math.E, 2*Math.PI*(-0.5*depthUnderwaterMetric)/waveLengthMetric);

                return 0.5 * waterDensity * dragCO * depthUnderwaterMetric * particleVelocity * particleVelocity + waterDensity * inertiaCO * ((Math.PI * depthUnderwaterMetric * depthUnderwaterMetric)/(4)) * particleAcceleration;
            } else {
                waveForce = -1;
            }
        }
        return 0;
    }
    function calcDebris(depthUnderwaterMetric:number, windVelocityMetric:number, waterVelocityMetric:number, debrisBuildupMetric:number){
        if(includeDebris){
            if(depthUnderwaterMetric > 0 && windVelocityMetric >= 0 && waterVelocityMetric >= 0 && debrisBuildupMetric >= 0){

                let equivRoughness = 0.03 * 0.5 * depthUnderwaterMetric;

                return (waterUnitWeight/g) * (waterVelocityMetric*waterVelocityMetric*n*n*debrisBuildupMetric)/(0.79*Math.pow(mMet(depthBeneathDebris,"d"),(1/3))) + (airUnitWeight/g) * (windVelocityMetric*windVelocityMetric*debrisBuildupMetric)/Math.pow((8.5+5.75*Math.log(AES/equivRoughness)),2);
            } else {
                return -1;
        }
        }
        return 0;
    }
    function calcWindIce(windVelocityMetric:number, planarIceAreaMetric:number, segmentLengthMetric:number){
        if(includeWindIce){
            if(planarIceArea > 0 && segmentLength > 0 && windVelocity >= 0){
                return airDensity * RDSLAirConstantIce * (planarIceAreaMetric/segmentLengthMetric) * windVelocityMetric * windVelocityMetric; 
            } else {
                return -1;
            }
        }
        return 0;
    }
    function calcCurrentIce(waterVelocityMetric:number, planarIceAreaMetric:number, segmentLengthMetric:number){
        if(includeCurrentIce){
            if(waterVelocityMetric >= 0 && planarIceAreaMetric >= 0 && segmentLengthMetric > 0){
                return waterDensity * RDSLWaterConstantIce * (planarIceAreaMetric/segmentLengthMetric) * waterVelocityMetric * waterVelocityMetric; 
            } else {
                return -1;
            }
        }
        return 0;
    }
    function calcHorizontalLoad(forceUsed:number, length:number, sag:number){
        if(sag <= 0){
            return -1;
        }
            return forceUsed * length / (8 * sag/100);
    }
    function calcVerticalLoad(forceUsed:number, distAlong:number, horizLoad:number, angle:number, length:number){
        if(length <= 0){
            return -1;
        }
            return horizLoad * Math.tan(angle) + ((forceUsed * length / 2) * (1 - (2 * distAlong / length)));
    }
    function calcTension(load:number, horizLoad:number){
            return Math.sqrt(horizLoad * horizLoad + load * load);
    }

</script>
<body>
    <title>Design Estimator</title>

    <main class="p-3 container-sm">
        <h2 class="px-3">Design Estimator</h2>
        <form>
            <!-- Top Row (Force Selection, Boomline Info, and Variables) -->
            <div class="row d-flex align-items-stretch">
                <div class="col-12 col-md-6 d-flex flex-column">
                    <!-- Force Selection Card-->
                    <div class="p-3">
                        <div class="card w-100">
                            <div class="card-header">
                                <div class="row align-items-center">
                                    <div class="col">
                                        <h5 class="card-title">Forces to Include</h5>
                                    </div>
                                    <div class="col-auto">
                                        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#forceModal">
                                            Help
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item">
                                    <SwitchField id="currentDragSwitch" label="Current Drag" bind:checked={includeCurrent} disabled={false}/>
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
                    </div>

                    <!-- Boomline Information Card -->
                    <div class="p-3">
                        <div class="card w-100">
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
                                <NumberInputField id="segmentLengthInput" placeholder="Length of Segment" bind:value={segmentLength} unit={distanceUnit} required={true} min={0}/>
                                <NumberInputField id="segmentAngleInput" placeholder="Angle of Segment with Flow" bind:value={segmentAngle} unit={"°"} required={true} min={0} max={90}/>
                                <NumberInputField id="sagRatioInput" placeholder="Sag Ratio" bind:value={sagRatio} unit={"%"} required={true} min={1} max={100}/>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-md-6" >
                    <!-- Needed Variables Card-->
                    <div class="p-3 h-100">
                        <div class="card w-100" style="height:100%;">
                        <div class="card-header">
                            <div class="row align-items-center">
                                <div class="col">
                                    <h5 class="card-title">Needed Variables</h5>
                                </div>
                                <div class="col-auto">
                                    <RadioButtonSet name="unitRadio"  selectedValue={isMetric} on:change={handleUnitChange} options={[{ id: 'metricRadio', label: 'Metric', value: "true" },{ id: 'impRadio', label: 'Imperial', value: "false" }]}/>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <NumberInputField id="waterVelocityInput" placeholder="Water Velocity" bind:value={waterVelocity} unit={distanceUnit+ "/s"} required={includeCurrent} hidden={!includeCurrent} min={0}/>
                            <NumberInputField id="debrisDepthInput" placeholder="Debris Depth" bind:value={debrisDepth} unit={distanceUnit} required={includeCurrent} hidden={!includeCurrent} min={0}/>
                            <NumberInputField id="windVelocityInput" placeholder="Wind Velocity" bind:value={windVelocity} unit={distanceUnit+ "/s"} required={(includeWind || includeDebris || includeWindIce || !(wavesKnown==="true"))} hidden={!(includeWind || includeDebris || includeWindIce || !(wavesKnown==="true"))} min={0}/>
                            <NumberInputField id="gustVelocityInput" placeholder="Gust Velocity" bind:value={gustVelocity} unit={distanceUnit+ "/s"} hidden={!(includeWind || includeDebris || includeWindIce)} min={0}/>
                            <RadioButtonSet name="waveRadio"  selectedValue={wavesKnown} on:change={handleWaveChange} options={[{ id: 'waveEntRadio', label: 'Enter Wave Period/Height', value: "true" },{ id: 'waveEstRadio', label: 'Estimate Wave Period/Height', value: "false" }]} hidden={!includeWave}/>
                            <NumberInputField id="wavePeriodInput" placeholder="Wave Period" bind:value={wavePeriod} unit={"s"} required={includeWave} hidden={!includeWave || !(wavesKnown==="true")} min={0}/>
                            <NumberInputField id="waveHeightInput" placeholder="Wave Height" bind:value={waveHeight} unit={distanceUnit} required={includeWave} hidden={!includeWave || !(wavesKnown==="true")} min={0}/>
                            <NumberInputField id="upstreamFetchInput" placeholder="Upstream Fetch" bind:value={upstreamFetch} unit={distanceUnit} required={!wavesKnown} hidden={!includeWave || (wavesKnown==="true")} min={0}/>
                            <NumberInputField id="normalDepthInput" placeholder="Normal Depth" bind:value={normalDepth} unit={distanceUnit} required={!wavesKnown} hidden={!includeWave || (wavesKnown==="true")} min={0}/>
                            <NumberInputField id="debrisBuildupInput" placeholder="Debris Buildup" bind:value={debrisBuildup} unit={distanceUnit+"²/"+distanceUnit} required={includeDebris} hidden={!includeDebris} min={0}/>
                            <NumberInputField id="depthBeneathDebrisInput" placeholder="Depth Beneath Debris" bind:value={depthBeneathDebris} unit={distanceUnit} required={includeDebris} hidden={!includeDebris} min={0}/>
                            <!--<RadioButtonSet name="iceRadio"  selectedValue={planarIceKnown} on:change={handleIceChange} options={[{ id: 'iceEntRadio', label: 'Enter Planar Ice Area', value: "true" },{ id: 'iceEstRadio', label: 'Estimate Planar Ice Area', value: "false" }]} hidden={!(includeWindIce || includeCurrentIce)}/>-->
                            <NumberInputField id="planarIceInput" placeholder="Planar Ice Area" bind:value={planarIceArea} unit={distanceUnit+"²"} required={includeWindIce || includeCurrentIce} hidden={!(includeCurrentIce || includeWindIce)} disabled={!(planarIceKnown === "true")} min={0}/>
                            <!--<NumberInputField id="riverWidthInput" placeholder="River Width" on:change={updatePlanarIce} bind:value={riverWidth} unit={distanceUnit} required={(includeWindIce || includeCurrentIce) && !(planarIceKnown === "true")} hidden={!(includeCurrentIce || includeWindIce) || (planarIceKnown === "true")} min={0}/>-->
                        </div>
                        <div class="card-footer d-grid gap-2">
                            <button
                            type="submit"
                            class="btn btn-primary"
                            on:click={calculateForces}
                        >
                            Calculate
                        </button>
                        </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Second Row (Force Results) -->
            <div class="row d-flex align-items-stretch" id="resultsBox">
                <div class="col-12 col-md-6 d-flex flex-column" >
                        <!-- Summary of Unfactored Forces Card -->
                        <div class="p-3 h-100" hidden={!validCalc}>
                            <div class="card w-100">
                                <div class="card-header">
                                    <div class="row align-items-center">
                                        <div class="col">
                                            <h5 class="card-title">
                                                Summary of Unfactored Forces
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-body" >

                                    <table class="table">
                                        <thead>
                                            <tr class="table-primary">
                                                <th scope="col"></th>
                                                <th scope="col">Magnitude</th>
                                                <th scope="col">Total</th>
                                                <th scope="col">Equivalent</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            <th scope="row">Current Drag</th>
                                            <td>{displayVal(currentForce, 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                            <td>{displayVal(currentForce*boomCount*mMet(boomLength, "d"), 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                            <td>{displayVal(currentForce*boomCount*mMet(boomLength, "d")/length90Current, 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                          </tr>
                                          <tr>
                                            <th scope="row">Wind Drag</th>
                                            <td>{displayVal(windForce, 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                            <td>{displayVal(windForce*boomCount*mMet(boomLength, "d"), 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                            <td>{displayVal(windForce*boomCount*mMet(boomLength, "d")/length90Current, 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                          </tr>
                                          <tr>
                                            <th scope="row">Wave Drag</th>
                                            <td>{displayVal(waveForce, 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                            <td>{displayVal(waveForce*boomCount*mMet(boomLength, "d"), 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                            <td>{displayVal(waveForce*boomCount*mMet(boomLength, "d")/length90Current, 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                          </tr>
                                          <tr>
                                            <th scope="row">Debris Drag</th>
                                            <td>{displayVal(debrisForce, 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                            <td>{displayVal(debrisForce*boomCount*mMet(boomLength, "d"), 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                            <td>{displayVal(debrisForce*boomCount*mMet(boomLength, "d")/length90Current, 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                          </tr>
                                          <tr>
                                            <th scope="row">Wind Drag on Ice</th>
                                            <td>{displayVal(windIceForce, 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                            <td>{displayVal(windIceForce*boomCount*mMet(boomLength, "d"), 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                            <td>{displayVal(windIceForce*boomCount*mMet(boomLength, "d")/length90Current, 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                          </tr>
                                          <tr>
                                            <th scope="row">Current Drag on Ice</th>
                                            <td>{displayVal(currentIceForce, 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                            <td>{displayVal(currentIceForce*boomCount*mMet(boomLength, "d"), 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                            <td>{displayVal(currentIceForce*boomCount*mMet(boomLength, "d")/length90Current, 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                          </tr>
                                          <tr class="table-secondary">
                                            <th scope="row">Sum of Forces</th>
                                            <td>{displayVal(unfactoredForce, 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                            <td>{displayVal(unfactoredForce*boomCount*mMet(boomLength, "d"), 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                            <td>{displayVal(unfactoredForce*boomCount*mMet(boomLength, "d")/length90Current, 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                          </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                </div>

                <div class="col-12 col-md-6">
                    <div class="p-3 h-100" hidden={!validCalc}>
                        <div class="card w-100  h-100">
                            <div class="card-header">
                                        <h5 class="card-title">
                                            Segment Load Summary
                                        </h5>
                            </div>
                            <div class="card-body" >
                                <table class="table">
                                    <thead>
                                      <tr>
                                        <th scope="col">Boom Sag</th>
                                        <th scope="col">Segment Angle</th>
                                        <th scope="col">Length ⊥ to Current</th>
                                        <th scope="col">Unfactored Force</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td>{sagRatio}%</td>
                                        <td>{segmentAngle}°</td>
                                        <td>{displayVal(length90Current, 3.281)} {distanceUnit}</td>
                                        <td>{displayVal(unfactoredForce, 1/14.5938)} {forceUnit}/{distanceUnit}</td>
                                      </tr>
                                    </tbody>
                                </table>
                                <RadioButtonSet name="forceRadio"  selectedValue={isTotalForce} on:change={handleForceChange} options={[{ id: 'totalForceRadio', label: 'Magnitude Force', value: "true" },{ id: 'equivalentForceRadio', label: 'Equivalent Force', value: "false" }]}/>
                                <div hidden={!(isTotalForce==="true")}>
                                <table class="table" >
                                    <thead>
                                      <tr>
                                        <th scope="col">Distance</th>
                                        <th scope="col">Max Tension</th>
                                        <th scope="col">Vertical Load</th>
                                        <th scope="col">Horizontal Load</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td>0 {distanceUnit}</td>
                                        <td>{displayVal(maxTension1[0], 1/4.448)} {forceUnit}</td>
                                        <td>{displayVal(verticalLoad1[0], 1/4.448)} {forceUnit}</td>
                                        <td>{displayVal(horizontalLoad[0], 1/4.448)} {forceUnit}</td>
                                      </tr>
                                      <tr>
                                        <td>{segmentLength} {distanceUnit}</td>
                                        <td>{displayVal(maxTension2[0], 1/4.448)} {forceUnit}</td>
                                        <td>{displayVal(verticalLoad2[0], 1/4.448)} {forceUnit}</td>
                                        <td>{displayVal(horizontalLoad[0], 1/4.448)} {forceUnit}</td>
                                      </tr>
                                    </tbody>
                                </table>
                                Max Tension in Boom Line Cable for Segment: {maxTension2[0] > maxTension1[0] ? displayVal(maxTension2[0], 1/4.448) : displayVal(maxTension1[0], 1/4.448)}
                            </div>
                                <div hidden={isTotalForce==="true"}>   
                                    <table class="table">
                                        <thead>
                                          <tr>
                                            <th scope="col">Distance</th>
                                            <th scope="col">Max Tension</th>
                                            <th scope="col">Vertical Load</th>
                                            <th scope="col">Horizontal Load</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            <td>0 {distanceUnit}</td>
                                            <td>{displayVal(maxTension1[1], 1/4.448)} {forceUnit}</td>
                                            <td>{displayVal(verticalLoad1[1], 1/4.448)} {forceUnit}</td>
                                            <td>{displayVal(horizontalLoad[1], 1/4.448)} {forceUnit}</td>
                                          </tr>
                                          <tr>
                                            <td>{segmentLength} {distanceUnit}</td>
                                            <td>{displayVal(maxTension2[1], 1/4.448)} {forceUnit}</td>
                                            <td>{displayVal(verticalLoad2[1], 1/4.448)} {forceUnit}</td>
                                            <td>{displayVal(horizontalLoad[1], 1/4.448)} {forceUnit}</td>
                                          </tr>
                                        </tbody>
                                    </table>
                                    Max Tension in Boom Line Cable for Segment: {maxTension2[1] > maxTension1[1] ? displayVal(maxTension2[1], 1/4.448) : displayVal(maxTension1[1], 1/4.448)}
                                </div>
                            </div>
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
    id="forceModal"
    tabindex="-1"
    aria-labelledby="forceModalLabel"
    aria-hidden="true"
>
    <div class="modal-dialog modal-lg">
        <!-- Use modal-lg for a larger modal if needed -->
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="forceModalLabel">
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