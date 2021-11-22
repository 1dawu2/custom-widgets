var getScriptPromisify = (src) => {
    return new Promise(resolve => {
        $.getScript(src, resolve)
    })
}

(function () {
    let template = document.createElement("template");
    template.innerHTML = `
    <style>
    #root {
      background-color: #100c2a;
    }
    #placeholder {
      padding-top: 1em;
      text-align: center;
      font-size: 1.5em;
      color: white;
    }
    </style>
    <div id="root" style="width: 100%; height: 100%;">
        <div id="placeholder">Time-Series Animation Chart</div>
    </div>
 `;

    class ColoredBox extends HTMLElement {
        constructor() {
            super();
            var _tableName;

            this._shadowRoot = this.attachShadow({ mode: 'open' })
            this._shadowRoot.appendChild(template.content.cloneNode(true))
      
            this._root = this._shadowRoot.getElementById('root')
      
            this._props = {}
        }

        get tableName() {
            return this._tableName;
        }
        set tableName(tableName) {
            console.log("setTitle:" + tableName);
            this._tableName = tableName;
        }

        _button = undefined;
        setButtonText1(button, text) {
            button.setText(text); // (2) OK
            _button = button;
            setTimeout(() => {
                this._button.setText(text); // (3) WILL NOT WORK!
            });
        }

        handleClick() {
            this._button.setText("Hello!"); // (4) WILL NOT WORK!
            this._dataSource;
            console.log(this._dataSource);
        }


        async render(resultSet) {
            await getScriptPromisify('https://cdn.bootcdn.net/ajax/libs/echarts/5.0.0/echarts.min.js')

            this._placeholder = this._root.querySelector('#placeholder')
            if (this._placeholder) {
                this._root.removeChild(this._placeholder)
                this._placeholder = null
            }
            if (this._myChart) {
                echarts.dispose(this._myChart)
            }
            var myChart = this._myChart = echarts.init(this._root, 'dark')


            const MEASURE_DIMENSION = 'Account'
            const dates = []
            const products = []
            const series = []
            console.log(resultSet);
            resultSet.forEach(dp => {
                const { rawValue, description } = dp[MEASURE_DIMENSION]
                const date = Number(dp.Date.description)
                const product = dp.Product.description

                if (dates.indexOf(date) === -1) {
                    dates.push(date);
                }

                if (products.indexOf(product) === -1) {
                    products.push(product);
                }

                const iT = dates.indexOf(date)
                series[iT] = series[iT] || []
                const iP = products.indexOf(product)
                series[iT][iP] = series[iT][iP] || []

                let iV
                if (description === 'Volume') {
                    iV = 0
                }
                series[iT][iP][iV] = rawValue
                series[iT][iP][1] = product
                series[iT][iP][2] = date

                //console.log(series);

            })

            const data = {
                products,
                series,
                dates
            }

            var itemStyle = {
                opacity: 0.8,
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }

            var sizeFunction = function (x) {
                var y = Math.sqrt(x / 5e8) + 0.1
                return y * 80
            }

            var schema = [
                { name: 'Volume', index: 0, text: 'Volume', unit: 'PCS' },
                { name: 'Product', index: 1, text: 'Product', unit: '' },
                { name: 'Date', index: 2, text: 'Date', unit: 'Year' }
            ]

            const option = {
                baseOption: {
                    timeline: {
                        axisType: 'category',
                        orient: 'vertical',
                        autoPlay: true,
                        inverse: true,
                        playInterval: 1000,
                        left: null,
                        right: 0,
                        top: 20,
                        bottom: 20,
                        width: 55,
                        height: null,
                        label: {
                            color: '#999'
                        },
                        symbol: 'none',
                        lineStyle: {
                            color: '#555'
                        },
                        checkpointStyle: {
                            color: '#bbb',
                            borderColor: '#777',
                            borderWidth: 2
                        },
                        controlStyle: {
                            showNextBtn: false,
                            showPrevBtn: false,
                            color: '#666',
                            borderColor: '#666'
                        },
                        emphasis: {
                            label: {
                                color: '#fff'
                            },
                            controlStyle: {
                                color: '#aaa',
                                borderColor: '#aaa'
                            }
                        },
                        data: []
                    },
                    backgroundColor: '#100c2a',
                    title: [{
                        text: data.dates[0],
                        textAlign: 'center',
                        left: '63%',
                        top: '55%',
                        textStyle: {
                            fontSize: 100,
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }, {
                        text: 'Volume by products and time',
                        left: 'center',
                        top: 10,
                        textStyle: {
                            color: '#aaa',
                            fontWeight: 'normal',
                            fontSize: 20
                        }
                    }],
                    tooltip: {
                        padding: 5,
                        backgroundColor: '#222',
                        borderColor: '#777',
                        borderWidth: 1,
                        formatter: function (obj) {
                            var value = obj.value
                            return schema[2].text + '：' + value[2] + '<br>' +
                                schema[1].text + '：' + value[1] + schema[1].unit + '<br>' +
                                schema[0].text + '：' + value[0] + schema[0].unit + '<br>'
                        }
                    },
                    grid: {
                        top: 100,
                        containLabel: true,
                        left: 30,
                        right: '110'
                    },
                    xAxis: {
                        type: 'log',
                        name: 'Volume',
                        max: 100000,
                        min: 300,
                        nameGap: 25,
                        nameLocation: 'middle',
                        nameTextStyle: {
                            fontSize: 18
                        },
                        splitLine: {
                            show: false
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#ccc'
                            }
                        },
                        axisLabel: {
                            formatter: '{value} $'
                        }
                    },
                    yAxis: {
                        type: 'value',
                        name: 'Time',
                        max: 100,
                        nameTextStyle: {
                            color: '#ccc',
                            fontSize: 18
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#ccc'
                            }
                        },
                        splitLine: {
                            show: false
                        },
                        axisLabel: {
                            formatter: '{value} Years'
                        }
                    },
                    visualMap: [
                        {
                            show: false,
                            dimension: 3,
                            categories: data.products,
                            calculable: true,
                            precision: 0.1,
                            textGap: 30,
                            textStyle: {
                                color: '#ccc'
                            },
                            inRange: {
                                color: (function () {
                                    var colors = ['#bcd3bb', '#e88f70', '#edc1a5', '#9dc5c8', '#e1e8c8', '#7b7c68', '#e5b5b5', '#f0b489', '#928ea8', '#bda29a']
                                    return colors.concat(colors)
                                })()
                            }
                        }
                    ],
                    series: [
                        {
                            type: 'scatter',
                            itemStyle: itemStyle,
                            data: data.series[0],
                            symbolSize: function (val) {
                                return sizeFunction(val[2])
                            }
                        }
                    ],
                    animationDurationUpdate: 1000,
                    animationEasingUpdate: 'quinticInOut'
                },
                options: []
            }

            console.log(data);

            for (var n = 0; n < data.dates.length; n++) {
                option.baseOption.timeline.data.push(data.dates[n])
                option.options.push({
                    title: {
                        show: true,
                        text: data.dates[n] + ''
                    },
                    series: {
                        name: data.dates[n],
                        type: 'scatter',
                        itemStyle: itemStyle,
                        data: data.series[n],
                        symbolSize: function (val) {
                            return sizeFunction(val[2])
                        }
                    }
                })
            }

            myChart.setOption(option)

        }

        onCustomWidgetResize(width, height) {
            this.render()
        }

        onCustomWidgetBeforeUpdate(changedProperties) {
            this._props = { ...this._props, ...changedProperties };
        }
        onCustomWidgetAfterUpdate(changedProperties) {
            if ("color" in changedProperties) {
                this.style["background-color"] = changedProperties["color"];
            }
            if ("opacity" in changedProperties) {
                this.style["opacity"] = changedProperties["opacity"];
            }
        }
    }
    customElements.define("com-box-htg-main", ColoredBox);
})();