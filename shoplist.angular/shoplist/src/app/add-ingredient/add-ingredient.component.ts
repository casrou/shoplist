import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { ShoppingListService } from '../shoppinglist.service';
import { Ingredient } from '../ingredient.models';

@Component({
    selector: 'app-add-ingredient',
    templateUrl: './add-ingredient.component.html',
    styleUrls: ['./add-ingredient.component.scss']
})
export class AddIngredientComponent implements OnInit {
    addIngredientForm;

    constructor(
        private shoppingListService: ShoppingListService,
        private formBuilder: FormBuilder
    ) {
        this.addIngredientForm = this.formBuilder.group({
            amount: '',
            measurement: '',
            ingredient: '',
            recipe: ''
        });
    }    

    ngOnInit(): void {
        
    }

    onAdd(ingredient: Ingredient){
        // let ingredient = {'amount': ingredientData.amount, 'measurement': ingredientData.measurement, 'ingredient': ingredientData.ingredient, 'recipe': ingredientData.recipe, 'id': this.generateID()}
        
        this.shoppingListService.addToList(ingredient);
        console.warn('Your ingredient has been added', ingredient);

        this.addIngredientForm.reset();
    }
}
