import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ShoppingListService {
    ingredients = [];

    addToList(ingredient){
        this.ingredients.push(ingredient);
        console.debug(this.ingredients);
    }

    getIngredients(){
        let i1 = {'amount': "10",
        'id': "_opcc0cgrk",
        'ingredient': "mel",
        'measurement': "g",
        'recipe': "kage"}
        this.addToList(i1)
        let i2 = {'amount': "20",
        'id': "_qm9c5l5o8",
        'ingredient': "sukker",
        'measurement': "ml",
        'recipe': "kage"}
        this.addToList(i2)
        return this.ingredients;
    }

    clearList(){
        this.ingredients = [];
        return this.ingredients;
    }
}