
export class Ingredient {
    amount: number;
    measurement: string;
    ingredient: string;
    recipe: string;
    id: string;

    private generateID(){
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    constructor(amount: number, measurement: string, ingredient: string, recipe: string) {
        this.amount = amount;
        this.measurement = measurement;
        this.ingredient = ingredient;
        this.recipe = recipe;
        this.id = this.generateID();
    }
}

export class ShoppingListItem {
    amount: number;
    measurement: string;
    ingredient: string;
    recipe: string[];
    id: string[];
}