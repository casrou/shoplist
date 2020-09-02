if (location.protocol === 'http:') {
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
}

let selectmeasurement = document.getElementById("selectmeasurement");
let inputIngredient = document.getElementById("inputIngredient");
let inputAmount = document.getElementById("inputAmount");

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

// let inputRecipe = document.getElementById("inputRecipe");
// let btnAddIngredient = document.getElementById("btnAddIngredient");
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

let tblIngredients = document.getElementById("tblIngredients");

function createRecipeCell(tags) {
    tags = Array.from(new Set(tags));
    let div = document.createElement("div");
    div.className = "tags";    
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        let span = document.createElement("span");
        span.className = "tag";
        let test3 = document.createTextNode(tag);
        span.appendChild(test3);
        div.appendChild(span);
    }
    return div;
}

function createRow(amount, measurement, ingredient, recipe, id) {
    let row = tblIngredients.getElementsByTagName('tbody')[0].insertRow();
    let amountCell = row.insertCell(0);
    let ingredientCell = row.insertCell(1);
    let recipeCell = row.insertCell(2);
    let controlsCell = row.insertCell(3);

    amountCell.innerHTML = `${amount} ${measurement}`;
    ingredientCell.innerHTML = ingredient;
    recipeCell.appendChild(createRecipeCell(recipe));
    controlsCell.innerHTML = `<a onclick="editRow('${id}')" class="icon">
        <i class="far fa-edit"></i>
        </a>
        <a onclick="deleteRow('${id}')" class="icon">
        <i class="far fa-trash-alt"></i>
        </a>`;
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

function updateTable(){
    var old_tbody = tblIngredients.getElementsByTagName('tbody')[0]
    var new_tbody = document.createElement('tbody');
    old_tbody.parentNode.replaceChild(new_tbody, old_tbody);
    for (let i = 0; i < shoppingLines.length; i++) {
        const line = shoppingLines[i];
        createRow(line.amount, line.measurement, line.ingredient, line.recipe, line.id)
    }
    let shouldCombine = checkCombineButton();
    if(shouldCombine) combineShoppingLines();
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
    updateTable();
}

function parseIngredientLine(line){
    let joinedmeasurements = measurements.join('|');
    // let re = new RegExp(`(\\d+|\\d+\\,\\d+|\\d+\\/\\d+)\\ (${joinedmeasurements})\\.{0,1}\\ ((?:[A-Z,a-z,æøå]+\\ {0,1})+)`)
    let re = new RegExp(`(\\d+|\\d+\\,\\d+|\\d+\\/\\d+)\\ (${joinedmeasurements})\\.{0,1}\\ (.+)`)

    let withmeasurement = line.match(re);
    let withoutmeasurement = line.match(/(\d+|\d+\/\d+)\ ((?:[A-Z,a-z,æøå]+\ {0,1})+)/)
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
    updateTable();
}

function handleIngredientPaste(event){
    let paste = (event.clipboardData || window.clipboardData).getData('text');

    let lines = paste.split('\n')
    if(lines.length == 0) return;

    if(lines.length > 1){
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            addIngredientLine(line);
        }
    } else {
        fillIngredientLine(lines[0]);
    }

    event.preventDefault();
}

inputIngredient.onpaste = handleIngredientPaste;
inputAmount.onpaste = handleIngredientPaste;

function editRow(id){
    let line = shoppingLines.find(sl => sl.id === id);
    deleteRow(id);
    fillForm(line.amount, line.measurement, line.ingredient, line.recipe.join(', '))    
}

function deleteRow(id){
    shoppingLines = shoppingLines.filter(sl => sl.id !== id);
    updateTable();
}

function checkCombineButton(){
    let btn = document.getElementById("btnCombine");
    let show = false;
    // let duplicates = shoppingLines.map(sl => sl.ingredient.toLowerCase() + "-" + sl.measurement);
    for (let i = 0; i < shoppingLines.length; i++) {
        const first = shoppingLines[i];
        for (let j = i + 1; j < shoppingLines.length; j++) {
            const second = shoppingLines[j];
            if(first.ingredient.toLowerCase() === second.ingredient.toLowerCase()){
                if(first.measurement === second.measurement){
                    show = true;
                } 
                let c1 = conversions.find(c => c.ingredient === first.ingredient && c.from === first.measurement && c.to === second.measurement);
                if(c1){
                    show = true;
                }
                let c2 = conversions.find(c => c.ingredient === first.ingredient && c.from === second.measurement && c.to === first.measurement);
                if(c2){
                    show = true;
                }
            }
        }
    }
    // if(show){//new Set(duplicates).size !== duplicates.length){
    //     btn.classList.remove("is-hidden");
    // } else {
    //     btn.classList.add("is-hidden");
    // }
    return show;
}

function combineShoppingLines(){
    let toDelete = [];
    let toAdd = [];
    for (let i = 0; i < shoppingLines.length; i++) {
        const first = shoppingLines[i];
        for (let j = i + 1; j < shoppingLines.length; j++) {
            const second = shoppingLines[j];
            if(first.ingredient.toLowerCase() !== second.ingredient.toLowerCase()) continue;

            if(first.measurement === second.measurement){
                // Same ingredient and same measurement
                toAdd.push({'amount': parseFloat(first.amount) + parseFloat(second.amount), 'measurement': first.measurement, 
                    'ingredient': first.ingredient, 'recipe': [first.recipe, second.recipe]})                    
                toDelete.push(first.id); toDelete.push(second.id);
                continue;
            }

            let c1 = conversions.find(c => c.ingredient === first.ingredient && c.from === first.measurement && c.to === second.measurement);
            if(c1){
                // Not the same measurements, but conversion was found
                toAdd.push({'amount': parseFloat(first.amount) * c1.factor + parseFloat(second.amount), 'measurement': c1.to, 
                    'ingredient': first.ingredient, 'recipe': [first.recipe, second.recipe]})                    
                toDelete.push(first.id); toDelete.push(second.id);
                continue;
            }

            let c2 = conversions.find(c => c.ingredient === first.ingredient && c.from === second.measurement && c.to === first.measurement);
            if(c2){
                // Not the same measurements, but conversion was found
                toAdd.push({'amount': parseFloat(second.amount) * c2.factor + parseFloat(first.amount), 'measurement': c2.to, 
                    'ingredient': first.ingredient, 'recipe': [first.recipe, second.recipe]})                    
                toDelete.push(first.id); toDelete.push(second.id);
                continue;
            }
        }
    }

    shoppingLines = shoppingLines.filter(sl => !toDelete.includes(sl.id))
    
    for (let i = 0; i < toAdd.length; i++) {
        const add = toAdd[i];
        addToShoppingList(add.amount, add.measurement, add.ingredient, add.recipe);
    }

    updateTable();
}

function generateID(){
    return '_' + Math.random().toString(36).substr(2, 9);
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

let conversions = [
    // {
    //     'ingredient': 'salt',
    //     'from': 'tsk',
    //     'to': 'g',
    //     'factor': 5.9 // 1 tsk = 5.9 g
    // }
]

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
        'factor': parseFloat(factor) // 1 tsk = 5.9 g
    })
    updateConversionList();
    // checkCombineButton();
    updateTable();
}

function updateConversionList(){
    let list = document.getElementById("liConversions")
    list.innerHTML = "";

    for (let i = 0; i < conversions.length; i++) {
        const c = conversions[i];
        let li = document.createElement("li");
        let text = document.createTextNode(`1 ${c.from} ${c.ingredient} = ${c.factor} ${c.to} ${c.ingredient}`)
        li.appendChild(text);
        list.appendChild(li);
    }
}