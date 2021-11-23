(function () {
    let template = document.createElement("template");
    template.innerHTML = `
    <form id="form">
    <fieldset>
    <legend>Colored Box Properties</legend>
    <table>
    <tr>
    <td>Opacity</td>
    <td><input id="builder_opacity" type="text" size="5"
   maxlength="5"></td>
    </tr>
    <tr>
    <td>Chart Type</td>
    <td>
        <select id="builder_chartType">
            <option>bar</option>
            <option>line</option>
        </select>
   </td>
    </tr>    
    </table>    
    <input type="submit" style="display:none;">
    </fieldset>
    </form>
    <span class="sapMBtnContent" id="__button1005-content"><bdi id="__button1005-BDI-content">Add x-Axis/Dimensions</bdi></span>
    <style>
    :host {
    display: block;
    padding: 1em 1em 1em 1em;
    }
    </style>
    `;
    class ColoredBoxBuilderPanel extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({ mode: "open" });
            this._shadowRoot.appendChild(template.content.cloneNode(true));

            this._shadowRoot.getElementById("form").addEventListener("submit",
                this._submit.bind(this));
        }
        _submit(e) {
            e.preventDefault();
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {
                        opacity: this.opacity
                        chartType: this.chartType
                    }
                }
            }));
        }
        set chartType(chartTypeNew) {
            this._shadowRoot.getElementById("builder_chartType").value =
            chartTypeNew;
        }

        get chartType() {
            return this._shadowRoot.getElementById("builder_chartType").value;
        }

        set opacity(newOpacity) {
            this._shadowRoot.getElementById("builder_opacity").value =
                newOpacity;
        }
        get opacity() {
            return this._shadowRoot.getElementById("builder_opacity").value;
        }
    }
    customElements.define("com-box-htg-builder",ColoredBoxBuilderPanel);
})();