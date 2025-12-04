let registeredRenderers = [];

df.ChartControl = class ChartControl extends df.WebBaseControl {
    constructor(sName, oPrnt) {
        super(sName, oPrnt);

        //  Properties
        this.prop(df.tString, "psTitle", "");
        this.prop(df.tString, "psSubtitle", "");
        this.prop(df.tString, "psChartType", "line");
        this.prop(df.tString, "psChartBackgroundColor", "");
        this.prop(df.tString, "psYAxisLabel", "");
        this.prop(df.tString, "psXAxisLabels", "");
        this.prop(df.tString, "psChartingLibrary", "");
        this.prop(df.tString, "psLegendAlignment", "right");
        this.prop(df.tBool, "pbLegendEnabled", true);
        this.prop(df.tBool, "pbZoomable", true);

        //  Events
        this.event("OnClick", df.cCallModeWait);

        this.chartData = null;
        this.chartInBuffer = false;
        this._eChart = null;
        this.chartController = undefined;
        this.isSvg = false;
    }

    openHtml(aHtml) {
        super.openHtml(aHtml);

        aHtml.push('<div class="Chart_Wrp">');
        if (this.isSvg) {
            aHtml.push('<div id="ChartContainer" style="width:100%;height:100%;"></div>');
        } else {
            aHtml.push('<Canvas id="ChartContainer" style="width:100%;height:100%;"></canvas>');
        }
    }

    closeHtml(aHtml) {
        aHtml.push('</div>');

        super.closeHtml(aHtml);
    }

    afterRender() {
        //Query the control and the chart
        this._eControl = df.dom.query(this._eElem, "div.Chart_Wrp");
        this._eChart = df.dom.query(this._eElem, "#ChartContainer");

        super.afterRender();

        this.set_psXAxisLabels(this.psXAxisLabels);

        //If there is a chart in the buffer call create chart again
        if (this.chartInBuffer) {
            this.chartInBuffer = false;
            this.createChart();
        }

    }

    //Function that handles creating a chart
    createChart() {
        let exists = false;
        //Assign the action data to chartdata, only if action data exists
        if (this._tActionData) this.chartData = this._tActionData;

        //Check if the chart element is loaded yet, if not make sure this method is called in the afterrender
        if (!this._eChart) {
            this.chartInBuffer = true;
            return;
        }

        //Double check to make sure the psXAxisLabel is an array
        if (!(this.psXAxisLabels instanceof Array)) this.set_psXAxisLabels(this.psXAxisLabels);

        //If there are no registered renderers throw an error
        if (registeredRenderers.length === 0) throw new df.Error(999, 'No charting libraries found, check your index.html if you included all files properly!');

        //Loop through each of the registered renderers and check if the name equals that of psChartingLibrary
        registeredRenderers.forEach(renderer => {
            if (renderer.name.includes(this.psChartingLibrary)) {
                exists = true;
                
                this.set_isSvg(renderer.isSvg);
                this.chartController = new renderer(this);
                return;
            }
        });

        //If the charting library cannot be found in the list throw an error
        if (!exists) {
            
            if (this.chartController) {
                throw new df.Error(999, 'The chart library you are trying to use does not exist, consult the documentation to see the available charting libraries!');
            } else {
                console.warn("Charting library was not found during initalization");
            }
            
        }

    }

    //Function add new series to the chart
    addNewSeries() {
        //add the data to the list in the control, so in case we switch to a different charting library we still have the information available
        this.chartData.push(this._tActionData);

        //Send the new data to the chart
        this.chartController.addNewSeries(this._tActionData);
    }

    //Function to add a single datapoint to a existing data series
    addNewDataPoint(datasetName, xAxisLabel) {
        let datasetIndex = null;
        let data = this._tActionData;

        this.chartData.forEach(dataseries => {
            // Check if the dataset name exists in chartdata
            if (dataseries.sLabel === datasetName) {
                datasetIndex = this.chartData.indexOf(dataseries);
            }
        });

        //If the dataset exists add the datapoint, otherwise throw an error
        if (datasetIndex !== null) {
            this.psXAxisLabels.push(xAxisLabel);
            this.chartData[datasetIndex].dataPoints.push(data);

            this.chartController.addNewDataPoint(datasetIndex, data);
        } else {
            throw new df.Error(999, "Dataset with specified name does not exist");
        }
    }

    //Change a single datapoint inside of a series
    changeDataPoint(datasetName, valueIndex, newValue) {
        newValue = parseFloat(newValue);
        let exists = false;
        let datasetIndex = null;

        this.chartData.forEach(element => {
            //Check if dataset that was passed exists
            if (element.sLabel === datasetName) {
                //Get the index of the found element
                datasetIndex = this.chartData.indexOf(element);
                //If the dataset is found, check if the old value exists
                if (valueIndex > this.chartData[datasetIndex].length) {
                    throw new df.Error(999, "Index out of bounds!");
                } else {
                    exists = true;
                }
            }
        });

        //If it exists change it, if it doesnt exist throw an error
        if (exists) {
            //Change the value in the chartdata monitored by the control itself
            this.chartData[datasetIndex].dataPoints[valueIndex].y = newValue;
            //Tell the chartdata inside of the chart to change too
            this.chartController.changeDataPoint(datasetIndex, valueIndex, newValue);
        } else {
            throw new df.Error(999, "The dataset specified does not exist");
        }
    }

    //Remove a dataset from the chart based on name
    removeDataset(datasetName) {
        let datasetIndex = null;

        //Look for the dataset inside of chartdata and if its found remove it
        this.chartData.forEach(element => {

            if (element.sLabel === datasetName) {

                datasetIndex = this.chartData.indexOf(element);
            }
        })

        //If the dataset is found delete it, otherwise throw an error
        if (datasetIndex !== null) {
            this.chartData.splice(datasetIndex, 1);
            this.chartController.removeDataset(datasetIndex);
        } else {
            throw new df.Error(999, "The dataset specified does not exist");
        }
    }

    //Send the OnClick data to the client
    sendOnClick(dataX, dataY, tooltip, dataIndex, datasetName) {
        this.fire("OnClick", [dataX, dataY, tooltip, dataIndex, datasetName]);
    }

    //Variable setter
    set_psChartingLibrary(sVal) {
        this.psChartingLibrary = sVal;

        //If the chartController already exists, remake the chart
        this.createChart();
    }

    //Variable setter
    set_psTitle(sVal) {
        this.psTitle = sVal;
    }

    //Variable setter
    set_psSubtitle(sVal) {
        this.psSubtitle = sVal;
    }

    //Variable setter
    set_isSvg(bVal) {
        this.isSvg = bVal;

        //If the chart element already exists, replace it with a canvas/div if necesary
        if (this._eChart) {
            //Remove the existing element first so that we can rerender a different element
            this._eChart.remove();
            if (this.isSvg) {
                this._eChart = document.createElement('div');
            } else {
                this._eChart = document.createElement('canvas');
            }

            //Set the width and height of the chart to the size of the div that it is located in
            this._eChart.style = "width:100%;height:100%";

            //Pass the id to the element
            this._eChart.id = "ChartContainer";

            this._eControl.appendChild(this._eChart);
        }
    }

    //Variable setter
    set_psChartType(sVal) {
        this.psChartType = sVal;
    }
    
    //Variable setter
    set_psXAxisLabels(sVal) {
        this.psXAxisLabels = sVal.split(', ');
    }

    //Variable setter
    set_psYAxisLabel(sVal) {
        this.psYAxisLabel = sVal;
    }

    //Variable setter
    set_psLegendAlignment(sVal) {
        this.psLegendAlignment = sVal;
    }

    //Variable setter
    set_pbLegendEnabled(bVal) {
        this.pbLegendEnabled = bVal;
    }

    //VariableSetter
    set_psChartBackgroundColor(sVal) {
        this.psChartBackgroundColor = sVal;
    }

    //Variable setter
    set_pbZoomable(bVal) {
        this.pbZoomable = bVal;
    }

    registerRenderer(renderer, svgBased) {
        renderer.isSvg = svgBased;
        registeredRenderers.push(renderer);
    }

    //Call a full refresh of the chart in order to update stuff such as the title.
    updateChart() {

        if (!(this.psXAxisLabels instanceof Array)) this.set_psXAxisLabels(this.psXAxisLabels);

        //Send a copy of the array. Because arrays are passed by reference this would mess with the chartData stored in the control itself
        Object.assign(this.chartController, {
            chartLocation: this._eChart,
            title: this.psTitle,
            backgroundColor: this.psChartBackgroundColor,
            chartData: [...this.chartData],
            subtitle: this.psSubtitle,
            chartType: this.psChartType,
            library: this.psChartingLibrary,
            xAxisLabels: this.psXAxisLabels,
            yAxisLabel: this.psYAxisLabel,
            legendAlignment: this.psLegendAlignment,
            legendEnabled: this.pbLegendEnabled,
            zoomable: this.pbZoomable
        })

        this.chartController.drawChart();
    }
}