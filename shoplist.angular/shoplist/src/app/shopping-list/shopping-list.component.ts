import { Component, OnInit } from '@angular/core';

import { ShoppingListService } from '../shoppinglist.service';
import { Ingredient, ShoppingListItem } from '../ingredient.models';

@Component({
    selector: 'app-shopping-list',
    templateUrl: './shopping-list.component.html',
    styleUrls: ['./shopping-list.component.scss']
})
export class ShoppingListComponent implements OnInit {
    ingredients: ShoppingListItem[] = [];

    constructor(
        private shoppingListService: ShoppingListService
    ) { }

    ngOnInit(): void {
        this.refreshList();
    }

    refreshList(){
        let temp: Ingredient[] = this.shoppingListService.getIngredients();
        let groups : Set<[string, string]> = new Set(temp.map(t => [t.ingredient, t.measurement]))
        this.ingredients = [];
        groups.forEach(i => 
            {
                const item = new ShoppingListItem();
                item.ingredient = i[0];
                item.measurement = i[1];
                let tempRecipeId = temp.filter(i => i.ingredient == item.ingredient && i.measurement == item.measurement);
                item.amount = tempRecipeId.reduce((a,b) => a + b.amount, 0);                
                item.recipe = tempRecipeId.map(i => i.recipe);
                item.id = tempRecipeId.map(i => i.id)
                this.ingredients.push(item);
            }
        );
    }

    // combineIngredients(ingredients) : any[]{
    //     return []
    // }

    editIngredient(editID){
        let ingredient: Ingredient = this.ingredients.map(i => new Ingredient(i.amount, i.measurement, i.ingredient, "")).find(i => i.id == editID);
        console.warn('edit', ingredient);
    }
}
