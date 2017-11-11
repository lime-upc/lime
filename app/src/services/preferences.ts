import { Injectable } from '@angular/core';


@Injectable()
export class StaticDataService {



  constructor() { }


  getPreferences(){
    return ["american_restaurant",
      "asian_restaurant",
      "bakery",
      "bar",
      "bar_grill",
      "barbecue_restaurant",
      "breakfast_restaurant",
      "buffet_restaurant",
      "cafe",
      "chinese_restaurant",
      "coffee_shop",
      "deli",
      "diner",
      "family_restaurant",
      "fast_food_restaurant",
      "french_restaurant",
      "hamburger_restaurant",
      "ice_cream_shop",
      "indian_restaurant",
      "italian_restaurant",
      "japanese_restaurant",
      "korean_restaurant",
      "liban_restaurant",
      "meal_takeaway",
      "mexican_restaurant",
      "pizza_delivery",
      "pizza_restaurant",
      "pub",
      "ramen_restaurant",
      "restaurant",
      "sandwich_shop",
      "seafood_restaurant",
      "sports_bar",
      "steak_house",
      "sushi_restaurant",
      "tea_house",
      "thai_restaurant"];
  }

  underscoreToText(name: string){
    let words = name.split("_");
    let results = "";
    for(let i = 0; i < words.length; i++){
      let currentWord = words[i];
      currentWord = currentWord.charAt(0).toUpperCase() + currentWord.slice(1).toLowerCase();
      results+=currentWord + " ";
    }
    return results.trim();
  }

}

