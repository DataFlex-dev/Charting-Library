# Charts library
The cChart wraps famous charting libraries such as [Chartjs](https://www.chartjs.org/) [Highcharts](https://www.highcharts.com/) and [Syncfusion](https://www.syncfusion.com/javascript-ui-controls/js-charts). This library lets you create charts that visualize your data inside of your web application. The DataFlex implementation has a generic API that works with all of the previously described Javascript charting libraries.

Keep in mind that Chartjs is a open source library and can be included in any project. Highcharts and Syncfusion however require a paid license. If you wish to use Highcharts you can find licensing options [here](https://shop.highcharts.com/). If you wish to use syncfusion you can find the licensing options [here](https://www.syncfusion.com/sales/unlimitedlicense).

For this reason the demo workspace also does not come with the Highcharts and Syncfusion sources by default. If you wish to add use Highcharts or Syncfusion within the demo workspace you can follow the last steps defined under the usage chapter.

## Overview
- The [Demo](Demo) folder contains a sample workspace which includes a WebApp sample demoing how the control can be used.
- The [Library](Library) folder contrains the actual library that should be attached to your workspace.
- The [Library\AppHtml\Charts](Library\AppHtml\Charts) folder contains the original full Javascript sources.
- For more information read the [documentation](Help\ChartLibraryDocumentation.pdf)

## Usage
To use the control in your workspace perform the following actions:
- Attach the library to your workspace.
- Copy the entire [Charts](Library\AppHtml\Charts) folder into your AppHtml folder.
- Delete the subfolders of the [Charts](Library\AppHtml\Charts) that you do not need. For example, if you intend to use Chartjs you can delete the HighCHarts and Syncfusion folders.
- If you use either [Highcharts](https://www.highcharts.com/download/) or [Syncfusion](https://www.syncfusion.com/downloads) you should download their sources from the respective links and add them to your AppHtml folder.
- Add the lines below to your index.html (or use OnDefineScriptIncludes for FlexTron):
```
<!-- Core (Must have this included) -->
<script src="Charts/ChartControl.js"></script>

<!-- Chartjs (Only needed if you use Chartjs) -->
<script src="Charts/Chartjs/chart.min.js"></script>
<script type="module" src="Charts/Chartjs/ChartjsRenderer.js"></script>

<!-- Highcharts (Only needed if you use Highcharts) -->
<script src="Path to Highcharts javascript file"></script>
<script type="module" src="Charts/HighCharts/HighChartsRenderer.js"></script>

<!-- Syncfusion (Only needed if you use Syncfusion) -->
<script src="Path to Syncfusion javascript file"></script>
<script type="module" src="Charts/Syncfusion/SyncfusionRenderer.js"></script>
```

Now the cChart control can be used within the application.

To use it in your application include it like so:
```
Use Charts\cChart.pkg
```