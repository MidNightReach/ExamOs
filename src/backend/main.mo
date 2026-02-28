import Time "mo:core/Time";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  // System State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data Models
  type UserProfile = {
    examType : Text;
    examMonth : Text;
    examYear : Nat;
    dailyStudyHours : Float;
  };

  type UserChapter = {
    chapterName : Text;
    subject : Text;
    importance : Nat;
    weakness : Nat;
    timesStudied : Nat;
    lastStudiedAt : ?Int;
  };

  type UserSubscription = {
    isPro : Bool;
    subscriptionExpiresAt : ?Int;
  };

  type UserStreak = {
    lastActiveDate : Text;
    currentStreak : Nat;
  };

  type MonthlyActivity = {
    month : Text;
    count : Nat;
  };

  type DailyPlanCount = {
    date : Text;
    count : Nat;
  };

  // Persistent Storage
  let userProfiles = Map.empty<Text, UserProfile>();
  let chapters = Map.empty<Text, Map.Map<Text, UserChapter>>();
  let userSubscriptions = Map.empty<Text, UserSubscription>();
  let userStreaks = Map.empty<Text, UserStreak>();
  let monthlyActivity = Map.empty<Text, MonthlyActivity>();
  let dailyPlanCounts = Map.empty<Text, DailyPlanCount>();

  // Syllabus Seed Data
  let physicsChapters = [
    ("Units & Dimensions", 2),
    ("Kinematics", 3),
    ("Laws of Motion", 4),
    ("Work Energy Power", 4),
    ("Rotational Motion", 5),
    ("Gravitation", 3),
    ("Properties of Matter", 3),
    ("Thermodynamics", 4),
    ("Kinetic Theory of Gases", 3),
    ("Oscillations", 4),
    ("Waves", 4),
    ("Electrostatics", 5),
    ("Current Electricity", 5),
    ("Magnetic Effects of Current", 5),
    ("Magnetism", 3),
    ("EMI & AC", 5),
    ("Ray Optics", 4),
    ("Wave Optics", 4),
    ("Modern Physics", 5),
    ("Semiconductor Devices", 4),
    ("Communication Systems", 2),
    ("Fluid Mechanics", 3),
    ("Thermal Properties", 3),
    ("Dual Nature of Matter", 4),
    ("Atoms & Nuclei", 4),
    ("Electric Potential", 4),
    ("Capacitors", 4),
    ("Moving Charges", 4),
    ("Alternating Current", 4),
    ("Electromagnetic Waves", 2),
  ];

  let chemistryChapters = [
    ("Some Basic Concepts", 2),
    ("Structure of Atom", 3),
    ("Classification of Elements", 2),
    ("Chemical Bonding", 4),
    ("States of Matter", 3),
    ("Thermodynamics Chem", 4),
    ("Equilibrium", 5),
    ("Redox Reactions", 3),
    ("Hydrogen", 2),
    ("s-Block Elements", 3),
    ("p-Block Elements", 4),
    ("Organic Chemistry Basics", 5),
    ("Hydrocarbons", 4),
    ("Environmental Chemistry", 2),
    ("Solid State", 4),
    ("Solutions", 4),
    ("Electrochemistry", 5),
    ("Chemical Kinetics", 5),
    ("Surface Chemistry", 3),
    ("General Principles of Extraction", 3),
    ("p-Block Advanced", 4),
    ("d and f Block", 4),
    ("Coordination Compounds", 5),
    ("Haloalkanes", 4),
    ("Haloarenes", 3),
    ("Alcohols Phenols Ethers", 4),
    ("Aldehydes Ketones", 5),
    ("Carboxylic Acids", 4),
    ("Amines", 4),
    ("Biomolecules", 3),
  ];

  let mathsChapters = [
    ("Sets Relations Functions", 3),
    ("Complex Numbers", 4),
    ("Quadratic Equations", 4),
    ("Permutations Combinations", 4),
    ("Binomial Theorem", 3),
    ("Sequences Series", 4),
    ("Straight Lines", 4),
    ("Circles", 4),
    ("Conic Sections", 5),
    ("3D Geometry", 5),
    ("Limits Continuity", 4),
    ("Derivatives", 4),
    ("Applications of Derivatives", 5),
    ("Integrals", 5),
    ("Applications of Integrals", 4),
    ("Differential Equations", 4),
    ("Vectors", 4),
    ("Matrices Determinants", 4),
    ("Probability", 5),
    ("Statistics", 3),
    ("Trigonometric Functions", 4),
    ("Inverse Trigonometry", 4),
    ("Mathematical Reasoning", 2),
    ("Linear Programming", 3),
    ("Relations Functions Advanced", 3),
    ("Continuity Differentiability", 4),
    ("Definite Integrals", 5),
    ("Binomial Advanced", 3),
    ("Complex Plane", 4),
    ("Coordinate Geometry", 4),
  ];

  func allChaptersInitialized(userId : Text) : Bool {
    chapters.containsKey(userId);
  };

  func initializeChapters(userId : Text) {
    let userChapters = Map.empty<Text, UserChapter>();

    // Populate chapters
    func addChapter(chapterName : Text, subject : Text, importance : Nat) {
      let chapter : UserChapter = {
        chapterName;
        subject;
        importance;
        weakness = 3;
        timesStudied = 0;
        lastStudiedAt = null;
      };
      userChapters.add(chapterName, chapter);
    };

    physicsChapters.values().forEach(func(ch) { addChapter(ch.0, "Physics", ch.1) });
    chemistryChapters.values().forEach(
      func(ch) { addChapter(ch.0, "Chemistry", ch.1) }
    );
    mathsChapters.values().forEach(func(ch) { addChapter(ch.0, "Maths", ch.1) });

    chapters.add(userId, userChapters);
  };

  func getTodayDateString() : Text {
    let nanosecondsInADay = 86400000000000;
    let daysSinceEpoch = (Time.now() / nanosecondsInADay).toNat();
    let epochOffset = 1970 * 365 + 8;

    let dayOfYear = (daysSinceEpoch + epochOffset) % 365;
    let year = if (dayOfYear >= epochOffset) { 1970 + ((dayOfYear - epochOffset) / 365) } else {
      1969;
    };

    let dayOfYear2024Prefix = if (dayOfYear < 100) {
      "0" # dayOfYear.toText();
    } else { dayOfYear.toText() };

    if (daysSinceEpoch < 10) {
      let dayString = daysSinceEpoch.toText();
      "2024-01-0" # dayString;
    } else if (daysSinceEpoch < 100) {
      if (daysSinceEpoch <= 31) {
        let dayString = daysSinceEpoch.toText();
        "2024-01-" # dayString;
      } else if (daysSinceEpoch <= 60) {
        let febDayString = (daysSinceEpoch - 31).toText();
        "2024-02-" # febDayString;
      } else if (daysSinceEpoch <= 91) {
        let marDayString = (daysSinceEpoch - 60).toText();
        "2024-03-" # marDayString;
      } else if (daysSinceEpoch <= 97) {
        let aprDayString = (daysSinceEpoch - 91).toText();
        "2024-04-" # aprDayString;
      } else {
        "2024-04-" # dayOfYear2024Prefix;
      };
    } else { dayOfYear2024Prefix };
  };

  public query ({ caller }) func getProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    let userId = caller.toText();
    userProfiles.get(userId);
  };

  public shared ({ caller }) func saveProfile(examType : Text, examMonth : Text, examYear : Nat, dailyStudyHours : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let userId = caller.toText();
    let profile : UserProfile = {
      examType;
      examMonth;
      examYear;
      dailyStudyHours;
    };
    userProfiles.add(userId, profile);
  };

  public query ({ caller }) func getChapters() : async [UserChapter] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access chapters");
    };
    let userId = caller.toText();

    if (not allChaptersInitialized(userId)) {
      initializeChapters(userId);
    };

    switch (chapters.get(userId)) {
      case (null) { [] };
      case (?userChapters) {
        userChapters.values().toArray();
      };
    };
  };

  public shared ({ caller }) func updateWeakness(chapterName : Text, weakness : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update chapters");
    };
    if (weakness < 1 or weakness > 5) {
      return false;
    };

    let userId = caller.toText();

    switch (chapters.get(userId)) {
      case (null) { false };
      case (?userChapters) {
        switch (userChapters.get(chapterName)) {
          case (null) { false };
          case (?chapter) {
            let updatedChapter : UserChapter = {
              chapter with weakness
            };
            userChapters.add(chapterName, updatedChapter);
            true;
          };
        };
      };
    };
  };

  public shared ({ caller }) func markChapterDone(chapterName : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark chapters as done");
    };
    let userId = caller.toText();

    switch (chapters.get(userId)) {
      case (null) { false };
      case (?userChapters) {
        switch (userChapters.get(chapterName)) {
          case (null) { false };
          case (?chapter) {
            let updatedChapter : UserChapter = {
              chapter with timesStudied = chapter.timesStudied + 1;
              lastStudiedAt = ?Time.now();
            };
            userChapters.add(chapterName, updatedChapter);

            updateStreak(userId);
            incrementMonthlyCount(userId);
            true;
          };
        };
      };
    };
  };

  // Subscription System
  public query ({ caller }) func getSubscription() : async UserSubscription {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access subscriptions");
    };
    let userId = caller.toText();
    switch (userSubscriptions.get(userId)) {
      case (null) { { isPro = false; subscriptionExpiresAt = null } };
      case (?subscription) { subscription };
    };
  };

  public shared ({ caller }) func togglePro() : async UserSubscription {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle Pro");
    };
    let userId = caller.toText();
    let currentTime = Time.now();

    switch (userSubscriptions.get(userId)) {
      case (null) {
        let newSub : UserSubscription = {
          isPro = true;
          subscriptionExpiresAt = ?(currentTime + 30 * 24 * 3600 * 1000000000);
        };
        userSubscriptions.add(userId, newSub);
        newSub;
      };
      case (?subscription) {
        if (subscription.isPro) {
          let newSub : UserSubscription = { isPro = false; subscriptionExpiresAt = null };
          userSubscriptions.add(userId, newSub);
          newSub;
        } else {
          let newSub : UserSubscription = {
            isPro = true;
            subscriptionExpiresAt = ?(currentTime + 30 * 24 * 3600 * 1000000000);
          };
          userSubscriptions.add(userId, newSub);
          newSub;
        };
      };
    };
  };

  // Streak System
  public query ({ caller }) func getStreak() : async UserStreak {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access streaks");
    };
    let userId = caller.toText();
    switch (userStreaks.get(userId)) {
      case (null) { { lastActiveDate = ""; currentStreak = 0 } };
      case (?streak) { streak };
    };
  };

  func updateStreak(userId : Text) {
    let today = getTodayDateString();
    switch (userStreaks.get(userId)) {
      case (null) {
        let newStreak : UserStreak = { lastActiveDate = today; currentStreak = 1 };
        userStreaks.add(userId, newStreak);
      };
      case (?streak) {
        if (streak.lastActiveDate == today) { return };
        let daysSinceLast = 1;
        if (daysSinceLast == 1) {
          let updatedStreak : UserStreak = {
            lastActiveDate = today;
            currentStreak = streak.currentStreak + 1;
          };
          userStreaks.add(userId, updatedStreak);
        } else {
          let resetStreak : UserStreak = {
            lastActiveDate = today;
            currentStreak = 1;
          };
          userStreaks.add(userId, resetStreak);
        };
      };
    };
  };

  // Monthly Done Count
  public query ({ caller }) func getMonthlyDoneCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access monthly count");
    };
    let userId = caller.toText();
    switch (monthlyActivity.get(userId)) {
      case (null) { 0 };
      case (?activity) { activity.count };
    };
  };

  func incrementMonthlyCount(userId : Text) {
    let currentMonth = getTodayDateString() # "-01";
    switch (monthlyActivity.get(userId)) {
      case (null) {
        monthlyActivity.add(userId, { month = currentMonth; count = 1 });
      };
      case (?activity) {
        if (activity.month == currentMonth) {
          monthlyActivity.add(
            userId,
            { month = currentMonth; count = activity.count + 1 },
          );
        } else {
          monthlyActivity.add(userId, { month = currentMonth; count = 1 });
        };
      };
    };
  };

  // Daily Plan Generation Count
  public query ({ caller }) func getDailyPlanCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access daily plan count");
    };
    let userId = caller.toText();
    switch (dailyPlanCounts.get(userId)) {
      case (null) { 0 };
      case (?dailyCount) { dailyCount.count };
    };
  };

  public shared ({ caller }) func incrementDailyPlanCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can increment daily plan count");
    };
    let userId = caller.toText();
    let today = getTodayDateString();
    switch (dailyPlanCounts.get(userId)) {
      case (null) {
        dailyPlanCounts.add(userId, { date = today; count = 1 });
        1;
      };
      case (?dailyCount) {
        if (dailyCount.date == today) {
          let newCount = dailyCount.count + 1;
          dailyPlanCounts.add(userId, { date = today; count = newCount });
          newCount;
        } else {
          dailyPlanCounts.add(userId, { date = today; count = 1 });
          1;
        };
      };
    };
  };
};
