import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

actor {
  type Cents = Nat;
  type Category = {
    #chips;
    #drink;
    #energy;
  };

  module Category {
    public func toText(category : Category) : Text {
      switch (category) {
        case (#chips) { "chips" };
        case (#drink) { "drink" };
        case (#energy) { "energy" };
      };
    };

    public func compare(category1 : Category, category2 : Category) : Order.Order {
      Text.compare(Category.toText(category1), Category.toText(category2));
    };
  };

  type Product = {
    id : Text;
    name : Text;
    emoji : Text;
    price : Cents;
    category : Category;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      switch (Text.compare(product1.name, product2.name)) {
        case (#equal) { Text.compare(product1.id, product2.id) };
        case (order) { order };
      };
    };
  };

  let products = Map.empty<Text, Product>();

  // Initialize with sample products
  products.add(
    "chipotle_chips",
    {
      id = "chipotle_chips";
      name = "Chipotle Chips";
      emoji = "🌶️";
      price = 99;
      category = #chips;
    },
  );
  products.add(
    "cola",
    {
      id = "cola";
      name = "Cola";
      emoji = "🥤";
      price = 199;
      category = #drink;
    },
  );
  products.add(
    "energy_bar",
    {
      id = "energy_bar";
      name = "Energy Bar";
      emoji = "🍫";
      price = 299;
      category = #energy;
    },
  );
  products.add(
    "potato_chips",
    {
      id = "potato_chips";
      name = "Potato Chips";
      emoji = "🥔";
      price = 89;
      category = #chips;
    },
  );

  public query ({ caller }) func getProduct(id : Text) : async Product {
    switch (products.get(id)) {
      case (null) {
        Runtime.trap("Product does not exist");
      };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query ({ caller }) func getProductsByCategory(category : Category) : async [Product] {
    products.values().toArray().filter(func(product) { product.category == category }).sort();
  };
};
