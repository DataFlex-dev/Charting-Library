# DataFlex Charting Library

## Contents

- [What this library does](#what-this-library-does)
- [Licensing and third-party files](#licensing-and-third-party-files)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Supported renderers and chart types](#supported-renderers-and-chart-types)
- [Data types](#data-types)
- [Properties](#properties)
- [Procedures and events](#procedures-and-events)
- [Examples](#examples)
- [Tips and limitations](#tips-and-limitations)
- [Troubleshooting](#troubleshooting)

## What this library does

The DataFlex Charting Library adds a `cChart` control to DataFlex WebApps. It lets you write your chart code once and choose which JavaScript library should render it:

- [Chart.js](https://www.chartjs.org/)
- [Highcharts](https://www.highcharts.com/)
- [Syncfusion JavaScript Charts](https://www.syncfusion.com/javascript-ui-controls/js-charts)

To create a chart, set the usual options such as the title and chart type, fill a `tChartData` array, and pass it to the control using the `CreateChart` procedure. Each item in that array is a series, and each series contains its values as `tPointData`.

On the browser side, the matching renderer turns this data into a Chart.js, Highcharts, or Syncfusion chart. You can:

- combine multiple series and chart types
- set colors for a complete series or individual points
- add custom tooltip text
- handle point clicks on the DataFlex server
- change a value without rebuilding the complete chart
- add or remove a series
- append points to a live chart
- change chart settings at runtime

This wrapper deliberately sticks to the options shared by the three renderers. It is meant to cover the common cases without tying the DataFlex code to one vendor; it does not expose every option offered by Chart.js, Highcharts, or Syncfusion.

## Licensing and third-party files

> **Important:** Highcharts and Syncfusion are paid/commercial charting products. If you use either one, you will need to arrange the appropriate license with the vendor.

For that reason, this repository does **not** include their minified source files. It only includes the renderer adapters needed to connect them to `cChart`. Download the vendor files separately and place them in your application's `AppHtml\Charts` folder.

Chart.js is open source and its license is included at `Library\AppHtml\Charts\Chartjs\LICENSE.txt`.

Licensing and downloads:

- Highcharts: [licensing](https://shop.highcharts.com/) and [downloads](https://www.highcharts.com/download/)
- Syncfusion: [licensing](https://www.syncfusion.com/sales/unlimitedlicense) and [downloads](https://www.syncfusion.com/downloads)
- Chart.js: [project website](https://www.chartjs.org/)

The license in the repository root covers our DataFlex wrapper and renderer code. Each third-party library keeps its own license.

## Installation

### 1. Attach the library

Attach the `Library` workspace to the DataFlex workspace where you want to use the control.

### 2. Copy the browser files

Copy `Library\AppHtml\Charts` to your application's `AppHtml` folder. Keep this structure:

```text
AppHtml/
└── Charts/
    ├── ChartControl.js
    ├── ChartBase/
    │   └── ChartBase.js
    ├── Chartjs/
    │   ├── chart.min.js
    │   ├── ChartjsRenderer.js
    │   └── LICENSE.txt
    ├── HighCharts/
    │   └── HighChartsRenderer.js
    └── Syncfusion/
        └── SyncfusionRenderer.js
```

You can remove the renderer folders your application does not need.

### 3. Add the selected vendor files

Chart.js is included. For Highcharts or Syncfusion, download the required JavaScript and CSS files from the vendor and add them yourself. The examples below use these filenames:

```text
AppHtml/Charts/HighCharts/highcharts.min.js
AppHtml/Charts/Syncfusion/ej2.min.js
AppHtml/Charts/Syncfusion/material.css
```

The actual filenames may differ between vendor packages. If so, adjust the paths in `Index.html`.

### 4. Include the scripts

Add `ChartControl.js`, your chosen vendor library, and the matching renderer to `Index.html`. The vendor library must come before its renderer.

```html
<!-- Required core -->
<script src="Charts/ChartControl.js"></script>

<!-- Chart.js -->
<script src="Charts/Chartjs/chart.min.js"></script>
<script type="module" src="Charts/Chartjs/ChartjsRenderer.js"></script>

<!-- Highcharts: install highcharts.min.js under your own license -->
<script src="Charts/HighCharts/highcharts.min.js"></script>
<script type="module" src="Charts/HighCharts/HighChartsRenderer.js"></script>

<!-- Syncfusion: install these vendor files under your own license -->
<link rel="stylesheet" href="Charts/Syncfusion/material.css">
<script src="Charts/Syncfusion/ej2.min.js"></script>
<script type="module" src="Charts/Syncfusion/SyncfusionRenderer.js"></script>
```

There is no need to load libraries you do not use. In FlexTron, add the same files through `OnDefineScriptIncludes`.

### 5. Include the DataFlex package

```dataflex
Use Charts\cChart.pkg
```

## Quick start

Here is a small line chart with one series:

```dataflex
Use Charts\cChart.pkg

Object oSalesChart is a cChart
    Set psTitle to "Monthly sales"
    Set psSubtitle to "Current year"
    Set psChartType to "line"
    Set psChartingLibrary to clChartjs
    Set psYAxisLabel to "Revenue"
    Set piColumnSpan to 12
    Set pbFillHeight to True

    Procedure OnLoad
        tChartData[] ChartData

        Forward Send OnLoad

        Move "Sales" to ChartData[0].sLabel
        Move "rgba(54, 162, 235, 0.7)" to ChartData[0].sSeriesColor
        Move 1200 to ChartData[0].dataPoints[0].y
        Move 1750 to ChartData[0].dataPoints[1].y
        Move 1430 to ChartData[0].dataPoints[2].y

        WebSet psXAxisLabels to "January, February, March"
        Send CreateChart ChartData
    End_Procedure
End_Object
```

Notice the comma and space between the x-axis labels. That exact `", "` sequence is the separator, so this produces the labels `January`, `February`, and `March`.

## Supported renderers and chart types

Use one of the constants declared by `cChart.pkg`:

| Constant | Value | Renderer |
|---|---|---|
| `clChartjs` | `"Chartjs"` | Chart.js |
| `clHighCharts` | `"HighCharts"` | Highcharts |
| `clSyncfusion` | `"Syncfusion"` | Syncfusion |

These are the values accepted by `psChartType`:

| Renderer | Supported values |
|---|---|
| Chart.js | `line`, `bar`, `doughnut`, `pie`, `scatter`, `bubble`, `polarArea`, `radar` |
| Highcharts | `line`, `bar`, `column`, `area`, `pie`, `doughnut`, `areaspline`, `scatter`, `spline` |
| Syncfusion | `line`, `bar`, `pie`, `doughnut`, `column`, `radar`, `stepline`, `stackingline`, `stackingline100`, `spline`, `area`, `stackingarea`, `stackingarea100`, `stackingsteparea`, `steparea`, `splinearea`, `stackingcolumn`, `stackingcolumn100`, `stackingbar`, `stackingbar100`, `scatter`, `bubble`, `polar`, `pareto` |

Chart type names are case-sensitive. The lists differ between renderers, so take that into account if your application lets users switch libraries.

## Data types

### `tPointData`

A `tPointData` holds one value in a series, together with any styling or tooltip text specific to that point.

| Member | Type | Description |
|---|---|---|
| `y` | `Number` | Numeric value plotted on the y-axis. |
| `sTooltip` | `String` | Optional extra text shown in the point tooltip. |
| `sBackgroundColor` | `String` | Optional background/fill color for this point. Overrides the series default. |
| `sHoverBackgroundColor` | `String` | Optional background/fill color while this point is hovered. |
| `sBorderColor` | `String` | Optional border color for this point. Overrides the series default. |
| `sHoverBorderColor` | `String` | Optional border color while this point is hovered. |

Color values go straight to the browser, so normal CSS color formats work:

```text
red
#36a2eb
rgb(54, 162, 235)
rgba(54, 162, 235, 0.5)
```

### `tChartData`

A `tChartData` holds one complete series (called a dataset by Chart.js).

| Member | Type | Default/behavior | Description |
|---|---|---|---|
| `sLabel` | `String` | Empty | Series name shown in the legend and used by update procedures. |
| `sSeriesColor` | `String` | Renderer default | Main series color. |
| `dataPoints` | `tPointData[]` | Empty | Ordered values in this series. |
| `sType` | `String` | Uses `psChartType` | Optional per-series chart type for mixed charts. |
| `nLineThickness` | `Number` | `2` | Line width or applicable series border width. |
| `nTension` | `Number` | Renderer default | Line curvature. A value between `0` and `0.5` is recommended: `0` gives a straight line and `0.5` gives the most curvature. In Highcharts and Syncfusion, any non-zero value changes a line to a spline. |
| `nPointRadius` | `Number` | `3` | Normal point/marker radius. |
| `nPointHoverRadius` | `Number` | `4` | Point/marker radius while hovered. |
| `nPointBorderWidth` | `Number` | `1` | Point/marker border width. |
| `sPointBackgroundColor` | `String` | Series color | Default background/fill color for all points. |
| `sPointHoverBackgroundColor` | `String` | Renderer default | Default point background/fill color while hovered. |
| `sPointBorderColor` | `String` | Series color | Default border color for all points. |
| `sPointHoverBorderColor` | `String` | Renderer default | Default point border color while hovered. |

When both are set, the color on `tPointData` wins over the series default.

## Properties

These properties belong to `cChart`. Use `Set` while defining the object and `WebSet`/`WebGet` when changing or reading them at runtime.

| Property | Type | Default | Description |
|---|---|---|---|
| `pbServerOnClick` | `Boolean` | `True` | Enables the server-side `OnClick` event. Disable it when point clicks do not need a server round trip. |
| `psTitle` | `String` | Empty | Main title shown above the chart. |
| `psSubtitle` | `String` | Empty | Secondary title shown below the main title. |
| `psChartType` | `String` | `"line"` | Top-level chart type. See the renderer type table above. |
| `psChartBackgroundColor` | `String` | Empty | Chart-area background color. An empty value leaves the renderer default. |
| `psYAxisLabel` | `String` | Empty | Title describing values on the y-axis. |
| `psXAxisLabels` | `String` | Empty | X-axis labels separated by `", "`. Order must match `dataPoints`. |
| `piXAxisLabelMinRotation` | `Integer` | `0` | Minimum x-axis label rotation in degrees. |
| `piXAxisLabelMaxRotation` | `Integer` | `50` | Maximum x-axis label rotation in degrees. |
| `pbShowXAxis` | `Boolean` | `True` | Shows or hides the x-axis. |
| `pbShowYAxis` | `Boolean` | `True` | Shows or hides the y-axis. |
| `psChartingLibrary` | `String` | `clChartjs` | Selects `clChartjs`, `clHighCharts`, or `clSyncfusion`. |
| `psLegendAlignment` | `String` | `"right"` | Legend position/alignment. Common values are `left`, `right`, `top`, and `bottom`; exact support depends on the renderer. |
| `pbLegendEnabled` | `Boolean` | `True` | Shows or hides the legend. |
| `pbZoomable` | `Boolean` | `True` | Enables zoom/pan where implemented by the renderer. Highcharts and Syncfusion use this value; the current Chart.js renderer does not configure a zoom plug-in. |
| `peHoverBehavior` | `Integer` | `hbIndex` | `hbNearest` targets the nearest point; `hbIndex` groups points at the same x-axis index. |
| `peTooltipLocation` | `Integer` | `tlNearest` | `tlNearest` places/follows near the point or pointer; `tlAverage` uses an averaged/group position. |

After changing a display property at runtime, redraw the chart with `UpdateChart`:

```dataflex
WebSet psTitle of oSalesChart to "Updated sales"
WebSet pbLegendEnabled of oSalesChart to False
Send UpdateChart of oSalesChart
```

### Hover behavior constants

| Constant | Meaning |
|---|---|
| `hbNearest` | Hover only the nearest point. |
| `hbIndex` | Hover/group points with the same x-axis index. |

### Tooltip location constants

| Constant | Meaning |
|---|---|
| `tlNearest` | Position the tooltip near the hovered point or pointer. |
| `tlAverage` | Position the tooltip at the average/group location. |

## Procedures and events

### `CreateChart`

```dataflex
Send CreateChart of oChart ChartData
```

Creates a chart from a `tChartData[]`, or replaces the chart that is already there.

```dataflex
Procedure CreateChart tChartData[] chartData
```

Set `psXAxisLabels` and fill all series before calling it. It is safe to call during loading; if the browser element is not ready yet, the control remembers the data and creates the chart after rendering.

### `ChangeDataPoint`

```dataflex
Send ChangeDataPoint of oChart "Sales" 2 1900
```

Changes one value in an existing series. The point index is zero-based.

```dataflex
Procedure ChangeDataPoint String sDatasetName Integer iIndex Number nNewValue
```

- `sDatasetName`: exact `tChartData.sLabel` of the target series;
- `iIndex`: zero-based index in `dataPoints`;
- `nNewValue`: replacement y value.

### `AddNewChartSeries`

```dataflex
Send AddNewChartSeries of oChart NewSeries
```

Adds one series to an existing chart.

```dataflex
Procedure AddNewChartSeries tChartData chartData
```

The new series should have one point for each existing x-axis label.

### `AddNewDataPoint`

```dataflex
Send AddNewDataPoint of oChart "Live series" "14:30:00" NewPoint
```

Appends a label to the x-axis and a point to an existing series.

```dataflex
Procedure AddNewDataPoint String sDatasetName String sXAxisLabel tPointData data
```

- `sDatasetName`: exact `tChartData.sLabel` of the target series;
- `sXAxisLabel`: new label appended to the x-axis;
- `data`: new point.

### `RemoveDataset`

```dataflex
Send RemoveDataset of oChart "Forecast"
```

Removes the series whose `sLabel` matches `sDatasetName`.

```dataflex
Procedure RemoveDataset String sDatasetName
```

### `UpdateChart`

```dataflex
Send UpdateChart of oChart
```

Redraws the chart with its current data and properties. Use it after changing the title, chart type, axes, legend, zoom, hover behavior, or another display option.

```dataflex
Procedure UpdateChart
```

Call `CreateChart` first. `UpdateChart` needs an existing chart and renderer.

### `OnClick`

Add this event to the `cChart` object when you want to do something with a clicked point:

```dataflex
Procedure OnClick String sLabel Number nValue String sTooltip Integer iIndex String sDatasetName
    // Handle selected point.
End_Procedure
```

Parameters:

| Parameter | Description |
|---|---|
| `sLabel` | X-axis/category label of the clicked point. |
| `nValue` | Numeric y value. |
| `sTooltip` | Custom `tPointData.sTooltip` text, or an empty string. |
| `iIndex` | Zero-based point index. |
| `sDatasetName` | `tChartData.sLabel` of the clicked series. |

If chart clicks do not need any server-side handling, set `pbServerOnClick` to `False` to avoid an unnecessary call to the server.

### Functions

There are no public DataFlex functions on `cChart` at the moment.

## Examples

### Bar chart with per-point colors and tooltips

```dataflex
Object oRevenueChart is a cChart
    Set psTitle to "Revenue by region"
    Set psChartType to "bar"
    Set psChartingLibrary to clChartjs
    Set psYAxisLabel to "Revenue in EUR"

    Procedure OnLoad
        tChartData[] ChartData

        Forward Send OnLoad

        Move "Revenue" to ChartData[0].sLabel

        Move 32000 to ChartData[0].dataPoints[0].y
        Move "12 active customers" to ChartData[0].dataPoints[0].sTooltip
        Move "rgba(54, 162, 235, 0.7)" to ChartData[0].dataPoints[0].sBackgroundColor

        Move 27500 to ChartData[0].dataPoints[1].y
        Move "9 active customers" to ChartData[0].dataPoints[1].sTooltip
        Move "rgba(255, 99, 132, 0.7)" to ChartData[0].dataPoints[1].sBackgroundColor

        Move 41000 to ChartData[0].dataPoints[2].y
        Move "15 active customers" to ChartData[0].dataPoints[2].sTooltip
        Move "#4bc0c0" to ChartData[0].dataPoints[2].sBackgroundColor

        WebSet psXAxisLabels to "North, South, West"
        Send CreateChart ChartData
    End_Procedure
End_Object
```

### Multiple and mixed series

Set `sType` when one series should use a different type from `psChartType`:

```dataflex
Procedure LoadSalesAndAverage
    tChartData[] ChartData

    Move "Sales" to ChartData[0].sLabel
    Move "rgba(54, 162, 235, 0.7)" to ChartData[0].sSeriesColor
    Move 12 to ChartData[0].dataPoints[0].y
    Move 18 to ChartData[0].dataPoints[1].y
    Move 15 to ChartData[0].dataPoints[2].y

    Move "Average" to ChartData[1].sLabel
    Move "line" to ChartData[1].sType
    Move "#ff6384" to ChartData[1].sSeriesColor
    Move 15 to ChartData[1].dataPoints[0].y
    Move 15 to ChartData[1].dataPoints[1].y
    Move 15 to ChartData[1].dataPoints[2].y

    WebSet psXAxisLabels of oSalesChart to "January, February, March"
    Send CreateChart of oSalesChart ChartData
End_Procedure
```

Whether a particular combination works still depends on the selected charting library.

### Change chart type at runtime

```dataflex
Procedure OnChange String sNewValue String sOldValue
    WebSet psChartType of oSalesChart to sNewValue
    Send UpdateChart of oSalesChart
End_Procedure
```

### Handle a point click

```dataflex
Object oClickableChart is a cChart
    Set pbServerOnClick to True

    Procedure OnClick String sLabel Number nValue String sTooltip Integer iIndex String sDatasetName
        Send ShowInfoBox (SFormat("%1 / %2: %3", sDatasetName, sLabel, nValue))
    End_Procedure
End_Object
```

### Append live data

```dataflex
Procedure AppendReading Number nReading String sTime
    tPointData NewPoint

    Move nReading to NewPoint.y
    Move (SFormat("Measured at %1", sTime)) to NewPoint.sTooltip

    Send AddNewDataPoint of oLiveChart "Live series" sTime NewPoint
End_Procedure
```

Create `"Live series"` with `CreateChart` before appending readings.

### Add and remove a series

```dataflex
Procedure AddForecast
    tChartData Forecast

    Move "Forecast" to Forecast.sLabel
    Move "rgba(255, 159, 64, 0.7)" to Forecast.sSeriesColor
    Move 20 to Forecast.dataPoints[0].y
    Move 22 to Forecast.dataPoints[1].y
    Move 24 to Forecast.dataPoints[2].y

    Send AddNewChartSeries of oSalesChart Forecast
End_Procedure

Procedure RemoveForecast
    Send RemoveDataset of oSalesChart "Forecast"
End_Procedure
```

## Tips and limitations

1. **Keep labels and points aligned.** For normal category charts, each series should contain the same number of `dataPoints` as the number of x-axis labels, in the same order.

2. **Use unique series labels.** `ChangeDataPoint`, `AddNewDataPoint`, and `RemoveDataset` find a series by `sLabel`. Duplicate labels make the target ambiguous.

3. **Use the exact x-axis separator.** The browser control splits `psXAxisLabels` on `", "`. A label containing comma-space will also be split. Avoid that sequence inside a label.

4. **Use `WebSet` at runtime.** `Set` establishes the initial value while `WebSet` changes the browser-side property after the web object exists.

5. **Redraw after property changes.** Call `UpdateChart` after changing most display properties. Data mutation procedures update the active chart themselves.

6. **Create before updating.** `ChangeDataPoint`, `AddNewChartSeries`, `AddNewDataPoint`, `RemoveDataset`, and `UpdateChart` require an existing chart.

7. **Do not mix unsupported types.** A type valid in Chart.js may be invalid in Highcharts or Syncfusion. Use the supported-type table when offering a renderer switch.

8. **Use CSS color values.** Colors are passed directly to the browser. Invalid color strings fall back according to vendor behavior.

9. **Know the zoom difference.** `pbZoomable` configures Highcharts and Syncfusion. The current Chart.js renderer does not include or configure a zoom plug-in.

10. **Be careful when appending to multi-series charts.** Each `AddNewDataPoint` call appends an x-axis label as well as a point. It is best suited to a live chart with one series. For a synchronized multi-series update at one new x position, rebuild all series with `CreateChart`.

11. **Limit long-running live charts.** Repeated appends retain all labels and points in browser memory. Periodically rebuild the chart with a bounded window when only recent readings matter.

12. **Disable unused server events.** Set `pbServerOnClick` to `False` when clicks do not need server handling.

13. **Keep vendor files out of redistribution.** Do not commit, package, or redistribute Highcharts or Syncfusion vendor source unless your license explicitly permits it.

## Troubleshooting

### “No charting libraries found”

This means the browser did not register a renderer before the chart was created.

Check that:

- `Charts/ChartControl.js` is included;
- the selected vendor's JavaScript file is included;
- the matching `*Renderer.js` file is included with `type="module"`;
- paths and filename casing match deployed files;
- browser developer tools show no script-load or module errors.

### Selected chart library does not exist

`psChartingLibrary` does not match a registered renderer. Prefer the constants:

```dataflex
Set psChartingLibrary to clChartjs
Set psChartingLibrary to clHighCharts
Set psChartingLibrary to clSyncfusion
```

Also check that the matching renderer and vendor files are loaded.

### Unsupported chart type

`psChartType` is not supported by the selected renderer. Chart type values are case-sensitive. Consult the [supported renderer table](#supported-renderers-and-chart-types).

### Dataset does not exist

The control could not find the series name passed to an update procedure. Check that `sDatasetName` exactly matches `tChartData.sLabel` and that `CreateChart` has already run.

### Data or labels appear under the wrong category

The x-axis labels and series points do not have the same count or order. Building both in the same loop is usually the easiest way to keep them aligned.

### Property change is not visible

Use `WebSet`, then call:

```dataflex
Send UpdateChart of oChart
```

### Highcharts or Syncfusion is undefined

The renderer loaded before its vendor library, or the path to the vendor file is wrong. Check the script order and paths in `Index.html`.
