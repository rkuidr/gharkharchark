import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Int "mo:core/Int";

actor {
  type Expense = {
    id : Text;
    amount : Float;
    category : Text;
    date : Text;
    paymentMode : Text;
    notes : Text;
    createdAt : Int;
  };

  module Expense {
    public func compareByDate(expense1 : Expense, expense2 : Expense) : Order.Order {
      Text.compare(expense1.date, expense2.date);
    };
  };

  type Settings = {
    monthlyBudget : Float;
    annualIncome : Float;
    darkMode : Bool;
    pinEnabled : Bool;
    pin : Text;
  };

  let expenses = Map.empty<Text, Expense>();
  var settings : ?Settings = ?{
    monthlyBudget = 20000.0;
    annualIncome = 300000.0;
    darkMode = false;
    pinEnabled = false;
    pin = "1234";
  };

  let months = [
    "2026-01-",
    "2026-02-",
    "2026-03-",
  ];
  let categories = [
    "Grocery",
    "Rent",
    "Electricity",
    "Water",
    "Gas",
    "EMI",
    "School Fees",
    "Medical",
    "Travel",
    "Shopping",
    "Other",
  ];
  let categoryAverages = [
    4800.0,
    11520.0,
    1518.0,
    374.0,
    280.0,
    2470.0,
    1312.0,
    1298.0,
    1790.0,
    1870.0,
    1173.0,
  ];

  func generateRandomAmount(base : Float) : Float {
    let randFactor = (Time.now() % 100_000) % 10;
    let adjustment = (randFactor.toFloat() - 5.0) * 0.04;
    let clampedAdjustment = Float.max(-0.2, Float.min(0.2, adjustment));
    base + (base * clampedAdjustment);
  };

  func generateRandomDaysForCategory(category : Text) : [Int] {
    switch (category) {
      case ("Grocery") { [3, 10, 17, 24] };
      case ("Rent") { [1] };
      case ("Electricity") { [10, 11, 12] };
      case ("Other") { [7, 18] };
      case ("Shopping") { [7, 16] };
      case ("Medical") { [17] };
      case ("Travel") { [18] };
      case ("School Fees") { [19] };
      case ("Gas") { [12, 28] };
      case ("Water") { [9, 21] };
      case ("EMI") { [14] };
      case ("Food") { [6, 15, 22] };
      case ("Fuel") { [11, 25] };
      case ("Internet") { [5] };
      case ("Entertainment") { [18, 27] };
      case ("Insurance") { [13] };
      case ("Tax") { [15] };
      case ("Maintenance") { [20] };
      case ("Stationery") { [8] };
      case ("Laundry") { [19] };
      case ("Subscription") { [16] };
      case ("Courier") { [3, 23] };
      case (_) { [5, 15, 25] };
    };
  };

  func generateSampleExpense(category : Text, amount : Float, monthIndex : Nat, day : Int, expenseIdSeed : Int, paymentMode : Text) : Expense {
    let expenseId = category.concat(day.toText());
    let expenseDate = months[monthIndex].concat(day.toText());
    let expenseAmount = generateRandomAmount(amount);
    let currentTime = Time.now();
    let notes = "Auto-generated expense: " # category;
    {
      id = expenseId;
      amount = expenseAmount;
      category;
      date = expenseDate;
      paymentMode;
      notes;
      createdAt = currentTime + (expenseIdSeed % 100_000);
    };
  };

  func generateSampleExpenses() : [Expense] {
    var allExpenses = Array.empty<Expense>();
    for (monthIndex in months.keys()) {
      for (categoryIndex in categories.keys()) {
        let category = categories[categoryIndex];
        let amount = categoryAverages[categoryIndex];
        let daysArray = generateRandomDaysForCategory(category);
        for (day in daysArray.values()) {
          let paymentMode = switch (category) {
            case ("Rent") { "Bank Transfer" };
            case ("Grocery") { "Cash" };
            case ("EMI") { "Credit Card" };
            case ("Travel") { "Bank Transfer" };
            case ("Medical") { "Bank Transfer" };
            case ("Shopping") { "Credit Card" };
            case (_) { "Bank Transfer" };
          };
          let expense = generateSampleExpense(category, amount, monthIndex, day, (monthIndex + 1) * 100 + categoryIndex, paymentMode);
          allExpenses := allExpenses.concat([expense]);
        };
      };
    };

    let extraCategories = [
      ("Food", 2187.0, 1, [6, 15, 22]),
      ("Fuel", 1703.0, 0, [11, 25]),
      ("Internet", 1298.0, 1, [5]),
      ("Entertainment", 1344.0, 2, [18, 27]),
      ("Insurance", 2188.0, 2, [13]),
      ("Tax", 2396.0, 0, [15]),
      ("Maintenance", 1955.0, 0, [20]),
      ("Stationery", 1109.0, 1, [8]),
      ("Laundry", 1099.0, 2, [19]),
      ("Subscription", 1590.0, 0, [16]),
      ("Courier", 987.0, 1, [3, 23]),
    ];

    for ((category, amount, monthIndex, days) in extraCategories.values()) {
      for (day in days.values()) {
        let paymentMode = switch (category) {
          case "Credit Card" { "Credit Card" };
          case (_) { "Cash" };
        };
        let expense = generateSampleExpense(category, amount, monthIndex, day, (monthIndex + 1) * 100, paymentMode);
        allExpenses := allExpenses.concat([expense]);
      };
    };

    allExpenses;
  };

  system func preupgrade() { };

  system func postupgrade() {
    if (expenses.isEmpty()) {
      let sampleExpenses = generateSampleExpenses();
      for (expense in sampleExpenses.values()) {
        expenses.add(expense.id, expense);
      };
    };
  };

  public shared ({ caller }) func addExpense(expense : Expense) : async () {
    if (expenses.containsKey(expense.id)) {
      Runtime.trap("Expense with ID " # expense.id # " already exists");
    };
    expenses.add(expense.id, expense);
  };

  public shared ({ caller }) func updateExpense(expense : Expense) : async () {
    if (not expenses.containsKey(expense.id)) {
      Runtime.trap("Expense with ID " # expense.id # " does not exist");
    };
    expenses.add(expense.id, expense);
  };

  public shared ({ caller }) func deleteExpense(id : Text) : async () {
    if (not expenses.containsKey(id)) {
      Runtime.trap("Expense with ID " # id # " does not exist");
    };
    expenses.remove(id);
  };

  public query ({ caller }) func getExpenses() : async [Expense] {
    let expenseArray = expenses.values().toArray();
    expenseArray.sort(Expense.compareByDate); // Uses custom compareByDate function
  };

  public query ({ caller }) func getExpensesByCategory(category : Text) : async [Expense] {
    let filtered = expenses.values().toArray().filter(
      func(e) { e.category == category }
    );
    filtered.sort(Expense.compareByDate); // Uses custom compareByDate function
  };

  public query ({ caller }) func getSettings() : async Settings {
    switch (settings) {
      case (null) { Runtime.trap("Failed to retrieve settings") };
      case (?currentSettings) { currentSettings };
    };
  };

  public shared ({ caller }) func updateSettings(newSettings : Settings) : async () {
    settings := ?newSettings;
  };
};
