if (location.protocol === 'http:') {
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
}

let selectmeasurement = document.getElementById("selectmeasurement");
let inputIngredient = document.getElementById("inputIngredient");
let inputAmount = document.getElementById("inputAmount");
let tblIngredients = document.getElementById("tblIngredients");

function validateNumberInput(event) {
    let input = event.target.value;
    if(input.match(/\d\/\d/)){
        let division = parseInt(input.split('/')[0]) / parseInt(input.split('/')[1])
        input = division
    } else if(input.match(/\d+\,\d+/)){
        input = input.replace(',', '.')
    } else if(input.endsWith(',') || input.endsWith('.') || input.endsWith('/')){
        return;
    }
    event.target.value = input;

    if(isNaN(input)){
        alert("Dette felt skal være et tal..")
        event.target.value = "";
    }
}
inputAmount.onkeyup = validateNumberInput;

function generateID(){
    return '_' + Math.random().toString(36).substr(2, 9);
}

// let inputRecipe = document.getElementById("inputRecipe");
// let btnAddIngredient = document.getElementById("btnAddIngredient");

// TODO: Support alternative spellings, etc. {'measurement': "g", 'alternatives': ["gram", "gr"]}
let measurements = ["stk",
    "g",
    "dl",
    "ml",
    "l",
    "tsk",
    "spsk",
    "pk",
    "fed",
    "bundt",
    "kviste",
    "håndfuld",
    "knivspids",
    "smule"];

for (let i = 0; i < measurements.length; i++) {
    const measurement = measurements[i];
    let tempOption = document.createElement("option");
    let textOption = document.createTextNode(measurement);
    tempOption.appendChild(textOption);
    selectmeasurement.appendChild(tempOption);
}

let shoppingLines = [];

const urlParams = new URLSearchParams(window.location.search);
const importShoppingLinesParam = urlParams.get('shoppingLines');

const localSaved = window.localStorage.getItem("shoppingLines");

if(importShoppingLinesParam){
    shoppingLines = JSON.parse(importShoppingLinesParam);
} else if(localSaved) {
    shoppingLines = JSON.parse(localSaved);
}

if(!shoppingLines) shoppingLines = [];

window.onload = function(){
    updateIngredientTable();
    updateConversionList();
};

function createRecipeCell(recipes, ids) {
    recipes = Array.from(new Set(recipes));
    let div = document.createElement("div");
    div.className = "tags";    
    for (let i = 0; i < recipes.length; i++) {
        const tag = recipes[i];
        let span = document.createElement("span");
        span.className = "tag";
        let text = document.createTextNode(tag);
        span.appendChild(text);
        let controls = document.createElement("span");
        if(Array.isArray(ids)){
            span.innerHTML += `<a onclick="editRow('${ids[i]}')" class="icon">
            <i class="far fa-edit"></i>
            </a>`;
        } else {
            span.innerHTML += `<a onclick="editRow('${ids}')" class="icon">
            <i class="far fa-edit"></i>
            </a>`;
        }
        
        // controls.innerHTML = `<a onclick="editRow('${ids[i]}')" class="icon">
        // <i class="far fa-edit"></i>
        // </a>
        // <a onclick="deleteRow('${ids[i]}')" class="icon">
        // <i class="far fa-trash-alt"></i>
        // </a>`;
        // span.appendChild(controls);
        div.appendChild(span);
    }
    return div;
}

function createRow(amount, measurement, ingredient, recipe, id) {
    let row = tblIngredients.getElementsByTagName('tbody')[0].insertRow();    
    let amountCell = row.insertCell(0);
    let ingredientCell = row.insertCell(1);
    let recipeCell = row.insertCell(2);
    // let controlsCell = row.insertCell(3);

    amountCell.innerHTML = `${amount} ${measurement}`;
    ingredientCell.innerHTML = ingredient;
    recipeCell.appendChild(createRecipeCell(recipe, id));
    // controlsCell.innerHTML = `<a onclick="editRow('${id}')" class="icon">
    //     <i class="far fa-edit"></i>
    //     </a>
    //     <a onclick="deleteRow('${id}')" class="icon">
    //     <i class="far fa-trash-alt"></i>
    //     </a>`;
    clearForm();
}

function fillForm(amount, measurement, ingredient, recipe) {
    document.getElementById("inputAmount").value = amount;
    document.getElementById("selectmeasurement").value = measurement;
    document.getElementById("inputIngredient").value = ingredient;
    if(recipe) document.getElementById("inputRecipe").value = recipe;
}

function clearForm() {
    document.getElementById("inputAmount").value = "";
    document.getElementById("selectmeasurement").value = "";
    document.getElementById("inputIngredient").value = "";
}

function updateIngredientTable(){
    var old_tbody = tblIngredients.getElementsByTagName('tbody')[0]
    var new_tbody = document.createElement('tbody');
    old_tbody.parentNode.replaceChild(new_tbody, old_tbody);
    let combinedShoppingLines = combineShoppingLines();
    for (let i = 0; i < combinedShoppingLines.length; i++) {
        const line = combinedShoppingLines[i];
        createRow(line.amount, line.measurement, line.ingredient, line.recipe, line.id)
    }
    // let shouldCombine = checkCombineButton();
    // if(shouldCombine) combineShoppingLines();
}

function addToShoppingList(amount, measurement, ingredient, recipe){
    shoppingLines.push({'amount': amount, 'measurement': measurement, 'ingredient': ingredient, 'recipe': recipe.flat(), 'id': generateID()});
}

btnAddIngredient.onclick = function() {
    let amount = document.getElementById("inputAmount").value;
    let measurement = document.getElementById("selectmeasurement").value;
    let ingredient = document.getElementById("inputIngredient").value;
    let recipes = document.getElementById("inputRecipe").value.split(", ");
    addToShoppingList(amount, measurement, ingredient, recipes)
    updateIngredientTable();
}

function parseIngredientLine(line){
    let joinedmeasurements = measurements.join('|');
    // let re = new RegExp(`(\\d+|\\d+\\,\\d+|\\d+\\/\\d+)\\ (${joinedmeasurements})\\.{0,1}\\ ((?:[A-Z,a-z,æøå]+\\ {0,1})+)`)
    let re = new RegExp(`(\\d+|\\d+\\,\\d+|\\d+\\/\\d+)\\ +(${joinedmeasurements})\\.{0,1}\\ +(.+)`)

    let withmeasurement = line.match(re);
    let withoutmeasurement = line.match(/(\d+|\d+\/\d+)\ +((?:[A-Z,a-z,æøå]+\ {0,1})+)/)
    let withoutAmountAndType = line.match(/((?:[A-Z,a-z,æøå]+\ {0,1})+)/)

    if(withmeasurement){
        return {'amount': withmeasurement[1], 'measurement': withmeasurement[2], 'ingredient': withmeasurement[3]}
    } else if(withoutmeasurement) {
        return {'amount': withoutmeasurement[1], 'measurement': "stk", 'ingredient': withoutmeasurement[2]}
    } else if(withoutAmountAndType){
        return {'amount': 1, 'measurement': "smule", 'ingredient': withoutAmountAndType[1]}
    } else {
        return null;
    }
}

function fillIngredientLine(line){
    let parsed = parseIngredientLine(line);
    if(!parsed) return;
    fillForm(parsed.amount, parsed.measurement, parsed.ingredient);
}

function addIngredientLine(line){
    let recipes = document.getElementById("inputRecipe").value.split(", ");
    let parsed = parseIngredientLine(line);
    if(!parsed) return;
    // createRow(parsed.amount, parsed.measurement, parsed.ingredient, recipe);
    addToShoppingList(parsed.amount, parsed.measurement, parsed.ingredient, recipes)
    // shoppingLines.push();
    updateIngredientTable();
}

function handleIngredientPaste(event){
    let paste = (event.clipboardData || window.clipboardData).getData('text');
    paste = paste.replace(/\t+/g, ' ');
    let lines = paste.split('\n')
    
    if(lines.length == 0) return;

    if(lines.length > 1){
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            line = line.trim();
            if(line.length < 1) continue;
            addIngredientLine(line);
        }
    } else {
        fillIngredientLine(lines[0]);
    }

    event.preventDefault();
}

// inputIngredient.onpaste = handleIngredientPaste;
// inputAmount.onpaste = handleIngredientPaste;
inputLucky.onpaste = handleIngredientPaste;

function editRow(id){
    let line = shoppingLines.find(sl => sl.id === id);
    deleteRow(id);
    fillForm(line.amount, line.measurement, line.ingredient, line.recipe.join(', '))    
}

function deleteRow(id){
    shoppingLines = shoppingLines.filter(sl => sl.id !== id);
    updateIngredientTable();
}

// function checkCombineButton(){
//     let btn = document.getElementById("btnCombine");
//     let show = false;
//     // let duplicates = shoppingLines.map(sl => sl.ingredient.toLowerCase() + "-" + sl.measurement);
//     for (let i = 0; i < shoppingLines.length; i++) {
//         const first = shoppingLines[i];
//         for (let j = i + 1; j < shoppingLines.length; j++) {
//             const second = shoppingLines[j];
//             if(first.ingredient.toLowerCase() === second.ingredient.toLowerCase()){
//                 if(first.measurement === second.measurement){
//                     show = true;
//                 } 
//                 let c1 = conversions.find(c => c.ingredient === first.ingredient && c.from === first.measurement && c.to === second.measurement);
//                 if(c1){
//                     show = true;
//                 }
//                 let c2 = conversions.find(c => c.ingredient === first.ingredient && c.from === second.measurement && c.to === first.measurement);
//                 if(c2){
//                     show = true;
//                 }
//             }
//         }
//     }
//     // if(show){//new Set(duplicates).size !== duplicates.length){
//     //     btn.classList.remove("is-hidden");
//     // } else {
//     //     btn.classList.add("is-hidden");
//     // }
//     return show;
// }

function combineHelper(result){
    // let result.toDelete = [];
    // let result.toAdd = [];
    let shoppingLines = result.combinedShoppingLines;

    for (let i = 0; i < shoppingLines.length; i++) {
        const first = shoppingLines[i];
        for (let j = i + 1; j < shoppingLines.length; j++) {
            const second = shoppingLines[j];
            if(first.ingredient.toLowerCase() !== second.ingredient.toLowerCase()) continue;

            if(first.measurement === second.measurement){
                // Same ingredient and same measurement
                result.toAdd.push({'amount': parseFloat(first.amount) + parseFloat(second.amount), 'measurement': first.measurement, 
                    'ingredient': first.ingredient, 'recipe': [first.recipe, second.recipe], 'id': [first.id, second.id]})                    
                result.toDelete.push(first.id); result.toDelete.push(second.id);
                return;
            }

            let c1 = conversions.find(c => c.ingredient === first.ingredient && c.from === first.measurement && c.to === second.measurement);
            if(c1){
                // Not the same measurements, but conversion was found
                result.toAdd.push({'amount': parseFloat(first.amount) * c1.factor + parseFloat(second.amount), 'measurement': c1.to, 
                    'ingredient': first.ingredient, 'recipe': [first.recipe, second.recipe], 'id': [first.id, second.id]})                    
                result.toDelete.push(first.id); result.toDelete.push(second.id);
                return;
            }

            let c2 = conversions.find(c => c.ingredient === first.ingredient && c.from === second.measurement && c.to === first.measurement);
            if(c2){
                // Not the same measurements, but conversion was found
                result.toAdd.push({'amount': parseFloat(second.amount) * c2.factor + parseFloat(first.amount), 'measurement': c2.to, 
                    'ingredient': first.ingredient, 'recipe': [first.recipe, second.recipe], 'id': [first.id, second.id]})                    
                result.toDelete.push(first.id); result.toDelete.push(second.id);
                return;
            }
        }
    }
    result.done = true;
}

function combineShoppingLines(){
    // let toDelete = [];
    // let toAdd = [];
    // let done = false;
    let result = {'done': false, 'toDelete': [], 'toAdd': [], 'combinedShoppingLines': shoppingLines};
    while(!result.done){
        // let result = {'done': true, 'toDelete': toDelete, 'toAdd': toAdd};
        combineHelper(result);

        result.combinedShoppingLines = result.combinedShoppingLines.filter(sl => !result.toDelete.includes(sl.id))
    
        for (let i = 0; i < result.toAdd.length; i++) {
            const add = result.toAdd[i];
            // addToShoppingList(add.amount, add.measurement, add.ingredient, add.recipe);
            result.combinedShoppingLines.push({'amount': add.amount, 'measurement': add.measurement, 'ingredient': add.ingredient, 'recipe': add.recipe.flat(), 'id': add.id});
        }
        result.toAdd = []
        result.toDelete = []
    }

    return result.combinedShoppingLines;
    // let toDelete = result.toDelete;
    // let toAdd = result.toAdd;
    

    // let combinedShoppingLines = shoppingLines.filter(sl => !toDelete.includes(sl.id))
    
    // for (let i = 0; i < toAdd.length; i++) {
    //     const add = toAdd[i];
    //     // addToShoppingList(add.amount, add.measurement, add.ingredient, add.recipe);
    //     combinedShoppingLines.push({'amount': add.amount, 'measurement': add.measurement, 'ingredient': add.ingredient, 'recipe': add.recipe.flat(), 'id': add.id});
    // }


    // return combinedShoppingLines;

    // updateTable();
}

/*
    CONVERSIONS
*/
let selectfromconversion = document.getElementById("inputConversionFrom");
let selecttoconversion = document.getElementById("inputConversionTo");

for (let i = 0; i < measurements.length; i++) {
    const measurement = measurements[i];
    let tempOption = document.createElement("option");
    let textOption = document.createTextNode(measurement);
    tempOption.appendChild(textOption);
    selectfromconversion.appendChild(tempOption);
}
for (let i = 0; i < measurements.length; i++) {
    const measurement = measurements[i];
    let tempOption = document.createElement("option");
    let textOption = document.createTextNode(measurement);
    tempOption.appendChild(textOption);
    selecttoconversion.appendChild(tempOption);
}

let conversions = []

const importConversionsParam = urlParams.get('conversions');
const localConversions = window.localStorage.getItem("conversions");
if(importShoppingLinesParam){
    conversions = JSON.parse(importConversionsParam);
} else if(localConversions) {
    conversions = JSON.parse(localConversions);
}

if(!conversions) conversions = [];

document.getElementById("inputConversionFactor").onkeyup = validateNumberInput;

btnConversionAdd.onclick = function() {
    let ingredient = document.getElementById("inputConversionIngredient").value;
    let from = document.getElementById("inputConversionFrom").value;
    let to = document.getElementById("inputConversionTo").value;
    let factor = document.getElementById("inputConversionFactor").value;
    conversions.push({
        'ingredient': ingredient,
        'from': from,
        'to': to,
        'factor': parseFloat(factor), // 1 tsk = 5.9 g
        'id': generateID()
    });
    updateConversionList();
    updateIngredientTable();
}

function deleteConversion(id){
    conversions = conversions.filter(c => c.id !== id)
    updateConversionList();
    updateIngredientTable();
}

function updateConversionList(){
    let list = document.getElementById("liConversions")
    list.innerHTML = "";

    for (let i = 0; i < conversions.length; i++) {
        const c = conversions[i];
        let li = document.createElement("li");
        let text = document.createTextNode(`1 ${c.from} ${c.ingredient} = ${c.factor} ${c.to} ${c.ingredient}`)
        li.appendChild(text);
        let del = document.createElement("a");
        del.innerHTML = `<a onclick="deleteConversion('${c.id}')" class="icon">
            <i class="far fa-trash-alt"></i>
        </a>`;
        li.appendChild(del);
        list.appendChild(li);
    }
}

/*
    SAVE AND EXPORT LIST
*/

// btnGenerate.onclick = function(){
//     let tbl = document.getElementById("tblIngredients");
//     let trs = tbl.querySelectorAll("tr");
//     trs.forEach(tr => {
//         tr.onclick = toggleDone;
//     });
//     localStorage.setItem("shoppingLines", JSON.stringify(shoppingLines))
// }

btnSave.onclick = function(){
    window.localStorage.setItem("shoppingLines", JSON.stringify(shoppingLines));
    window.localStorage.setItem("conversions", JSON.stringify(conversions));
}

btnExport.onclick = function(){
    var copyText = document.getElementById("exportUrl");
    copyText.classList.remove("is-hidden");
    copyText.value = `https://mad.crcn.dk?shoppingLines=` + JSON.stringify(shoppingLines) + `&conversions=` + JSON.stringify(conversions);

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /*For mobile devices*/

    /* Copy the text inside the text field */
    document.execCommand("copy");
    copyText.classList.add("is-hidden");
    alert("Linket til indkøbslisten er kopieret. ")
}

/*
    SHOPPING LIST
*/

function toggleDone(event){
    event.target.parentNode.classList.toggle("doneShopping");
}

let shoppingView = false;
btnShopping.onclick = function(){
    // window.localStorage.setItem("shoppingLines", JSON.stringify(shoppingLines));
    document.getElementById("divAddIngredient").classList.toggle("is-hidden");
    document.getElementById("divAddConversion").classList.toggle("is-hidden");
    let rows = document.getElementById("tblIngredients").rows;
    
    shoppingView = !shoppingView;

    for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        if(r.parentNode.nodeName === "THEAD") continue;

        if(shoppingView){
            r.addEventListener('click', toggleDone, false);
        } else {
            r.removeEventListener('click', toggleDone, false);
            r.classList.remove("doneShopping");
        }
        
        console.debug(r.classList)
        console.debug(r.parentNode.nodeName)
    }
    // if(shoppingView){
    //     Array.from(rows).forEach(r => {
    //         r.addEventListener('click', toggleDone, false);
    //         // r.onclick = toggleDone;
    //     });
    // } else {
    //     Array.from(rows).forEach(r => {
    //         r.removeEventListener('click', toggleDone, false);
    //         r.classList.remove("doneShopping");
    //         // r.onclick = toggleDone;
    //     });
    // }
}