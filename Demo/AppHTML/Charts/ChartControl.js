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
        this.prop(df.tInt, "piXAxisLabelMinRotation", 0);
        this.prop(df.tInt, "piXAxisLabelMaxRotation", 50);
        this.prop(df.tBool, "pbShowXAxis", true);
        this.prop(df.tBool, "pbShowYAxis", true);
        this.prop(df.tString, "psChartingLibrary", "");
        this.prop(df.tString, "psLegendAlignment", "right");
        this.prop(df.tBool, "pbLegendEnabled", true);
        this.prop(df.tBool, "pbZoomable", true);
        this.prop(df.tInt, "peHoverBehavior", 0);
        this.prop(df.tInt, "peTooltipLocation", 0);

        //  Events
        this.event("OnClick", df.cCallModeWait);

        this.chartData = null;
        this.chartInBuffer = false;
        this._aXAxisLabels = [];
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
        //Assign the action data to chartdata, only if action data exists
        if (this._tActionData) this.chartData = this._tActionData;

        //Check if the chart element is loaded yet, if not make sure this method is called in the afterrender
        if (!this._eChart) {
            this.chartInBuffer = true;
            return;
        }

        //If there are no registered renderers throw an error
        if (registeredRenderers.length === 0) throw new df.Error(999, 'No charting libraries found, check your index.html if you included all files properly!');

        //Find the registered renderer matching psChartingLibrary
        const renderer = registeredRenderers.find(renderer => renderer.name.includes(this.psChartingLibrary));
        if (renderer) {
            this.set_isSvg(renderer.isSvg);
            this.chartController = new renderer(this);
        } else {
            //If the charting library cannot be found in the list throw an error
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
        const datasetIndex = this.chartData.findIndex(({ sLabel }) => sLabel === datasetName);
        if (datasetIndex === -1) {
            throw new df.Error(999, "Dataset with specified name does not exist");
        }

        const data = this._tActionData;
        this._aXAxisLabels.push(xAxisLabel);
        this.chartData[datasetIndex].dataPoints.push(data);
        this.chartController.addNewDataPoint(datasetIndex, data);
    }

    //Change a single datapoint inside of a series
    changeDataPoint(datasetName, valueIndex, newValue) {
        const datasetIndex = this.chartData.findIndex(({ sLabel }) => sLabel === datasetName);
        if (datasetIndex === -1) {
            throw new df.Error(999, "The dataset specified does not exist");
        }

        const dataPoints = this.chartData[datasetIndex].dataPoints;
        if (valueIndex < 0 || valueIndex >= dataPoints.length) {
            throw new df.Error(999, "Index out of bounds!");
        }

        const value = parseFloat(newValue);
        dataPoints[valueIndex].y = value;
        this.chartController.changeDataPoint(datasetIndex, valueIndex, value);
    }

    //Remove a dataset from the chart based on name
    removeDataset(datasetName) {
        const datasetIndex = this.chartData.findIndex(({ sLabel }) => sLabel === datasetName);
        if (datasetIndex === -1) {
            throw new df.Error(999, "The dataset specified does not exist");
        }

        this.chartData.splice(datasetIndex, 1);
        this.chartController.removeDataset(datasetIndex);
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
    set_psXAxisLabels(sVal) {
        this._aXAxisLabels = sVal.split(', ');
    }

    registerRenderer(renderer, svgBased) {
        renderer.isSvg = svgBased;
        registeredRenderers.push(renderer);
    }

    //Call a full refresh of the chart in order to update stuff such as the title.
    updateChart() {

        this.chartController.syncFromControl(this);
        this.chartController.drawChart();
    }
}