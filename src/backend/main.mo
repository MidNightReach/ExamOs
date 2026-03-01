import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";

actor {
  // System State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data Models
  public type UserProfile = {
    examType : Text;
    examMonth : Text;
    examYear : Nat;
    dailyStudyHours : Float;
  };

  public type UserChapter = {
    chapterName : Text;
    subject : Text;
    importance : Nat;
    weakness : Nat;
    timesStudied : Nat;
    lastStudiedAt : ?Int;
  };

  public type UserSubscription = {
    isPro : Bool;
    subscriptionExpiresAt : ?Int;
  };

  public type UserStreak = {
    lastActiveDate : Text;
    currentStreak : Nat;
  };

  public type MonthlyActivity = {
    month : Text;
    count : Nat;
  };

  public type DailyPlanCount = {
    date : Text;
    count : Nat;
  };

  public type PYQQuestion = {
    id : Text;
    questionText : Text;
    optionA : Text;
    optionB : Text;
    optionC : Text;
    optionD : Text;
    correctOption : Text;
    year : Nat;
    subject : Text;
    chapter : Text;
    difficulty : Text;
    examType : Text;
  };

  public type DailyPracticeCount = {
    date : Text;
    count : Nat;
  };

  public type WeeklyMockCount = {
    weekKey : Text;
    count : Nat;
  };

  public type MockResult = {
    id : Text;
    timestamp : Int;
    score : Int;
    totalQuestions : Nat;
    accuracy : Float;
    physicsCorrect : Nat;
    chemCorrect : Nat;
    mathsCorrect : Nat;
  };

  // Persistent Storage
  var openAiKey = "";

  let userProfiles = Map.empty<Text, UserProfile>();
  let chapters = Map.empty<Text, Map.Map<Text, UserChapter>>();
  let userSubscriptions = Map.empty<Text, UserSubscription>();
  let userStreaks = Map.empty<Text, UserStreak>();
  let monthlyActivity = Map.empty<Text, MonthlyActivity>();
  let dailyPlanCounts = Map.empty<Text, DailyPlanCount>();
  let questions = Map.empty<Text, PYQQuestion>();
  let dailyPracticeCounts = Map.empty<Text, DailyPracticeCount>();
  let weeklyMockCounts = Map.empty<Text, WeeklyMockCount>();
  let mockResults = Map.empty<Text, [MockResult]>();

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
    let nanosecondsInADay : Int = 86400000000000;
    let daysSinceEpoch : Int = Time.now() / nanosecondsInADay;
    let epochOffset : Int = 1970 * 365 + 8;

    let dayOfYear = (daysSinceEpoch + epochOffset) % 365;
    let _year = if (dayOfYear >= epochOffset) { 1970 + ((dayOfYear - epochOffset) / 365) } else {
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
        let febDayInt = daysSinceEpoch - 31;
        let febDayString = febDayInt.toText();
        "2024-02-" # febDayString;
      } else if (daysSinceEpoch <= 91) {
        let marDayInt = daysSinceEpoch - 60;
        let marDayString = marDayInt.toText();
        "2024-03-" # marDayString;
      } else if (daysSinceEpoch <= 97) {
        let aprDayInt = daysSinceEpoch - 91;
        let aprDayString = aprDayInt.toText();
        "2024-04-" # aprDayString;
      } else {
        "2024-04-" # dayOfYear2024Prefix;
      };
    } else { dayOfYear2024Prefix };
  };

  func getWeekKeyString() : Text {
    let daysSinceEpoch = (Time.now() / 86400000000000);
    let dayOfYear = daysSinceEpoch % 365;
    let weekNumber = (dayOfYear / 7) + 1;
    let weekNumberText = if (weekNumber < 10) {
      "0" # weekNumber.toText();
    } else { weekNumber.toText() };
    "2024-W" # weekNumberText;
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

  // PYQ Question Bank Functions
  public shared ({ caller }) func addQuestion(questionText : Text, optionA : Text, optionB : Text, optionC : Text, optionD : Text, correctOption : Text, year : Nat, subject : Text, chapter : Text, difficulty : Text, examType : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add questions");
    };

    let id = Time.now().toText() # "-" # year.toText();
    let question : PYQQuestion = {
      id;
      questionText;
      optionA;
      optionB;
      optionC;
      optionD;
      correctOption;
      year;
      subject;
      chapter;
      difficulty;
      examType;
    };
    questions.add(id, question);
    id;
  };

  public shared ({ caller }) func updateQuestion(id : Text, questionText : Text, optionA : Text, optionB : Text, optionC : Text, optionD : Text, correctOption : Text, year : Nat, subject : Text, chapter : Text, difficulty : Text, examType : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update questions");
    };

    switch (questions.get(id)) {
      case (null) { false };
      case (?_) {
        let updatedQuestion : PYQQuestion = {
          id;
          questionText;
          optionA;
          optionB;
          optionC;
          optionD;
          correctOption;
          year;
          subject;
          chapter;
          difficulty;
          examType;
        };
        questions.add(id, updatedQuestion);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteQuestion(id : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete questions");
    };

    switch (questions.get(id)) {
      case (null) { false };
      case (?_) {
        questions.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getQuestions() : async [PYQQuestion] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access questions");
    };
    questions.values().toArray();
  };

  public query ({ caller }) func getQuestionsByFilter(subject : Text, chapter : Text, difficulty : Text, examType : Text) : async [PYQQuestion] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can filter questions");
    };

    let filtered = questions.values().filter(func(q) {
      (subject.isEmpty() or q.subject == subject) and
      (chapter.isEmpty() or q.chapter == chapter) and
      (difficulty.isEmpty() or q.difficulty == difficulty) and
      (examType.isEmpty() or q.examType == examType)
    });
    filtered.toArray();
  };

  // AI Solution Functions
  public shared ({ caller }) func setOpenAiKey(key : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set OpenAI key");
    };
    openAiKey := key;
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func generateSolution(questionText : Text, optionA : Text, optionB : Text, optionC : Text, optionD : Text, correctOption : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate solutions");
    };

    if (openAiKey.isEmpty()) {
      return "Solution unavailable";
    };

    let systemPrompt = "You are a JEE expert tutor. Provide a concise step-by-step solution.";
    let userPrompt = "Question: " # questionText # "\nOptions: A) " # optionA # " B) " # optionB # " C) " # optionC # " D) " # optionD # "\nCorrect Answer: " # correctOption # "\n\nProvide solution in this exact format:\nStep 1: [first step]\nStep 2: [second step]\nStep 3: [third step]\nFinal Answer: [answer with brief explanation]\nShortcut: [shortcut method if applicable, else 'None']\nCommon Mistake: [common error students make]";

    let requestBody = "{\"model\": \"gpt-4o-mini\", \"messages\": [{\"role\": \"system\", \"content\": \"" # systemPrompt # "\"}, {\"role\": \"user\", \"content\": \"" # userPrompt # "\"}], \"max_tokens\": 500}";

    let headers = [
      { name = "Content-Type"; value = "application/json" },
      { name = "Authorization"; value = "Bearer " # openAiKey },
    ];

    try {
      let response = await OutCall.httpPostRequest(
        "https://api.openai.com/v1/chat/completions",
        headers,
        requestBody,
        transform,
      );
      switch (parseOpenAiResponse(response)) {
        case (?solution) { solution };
        case (null) { "Solution unavailable" };
      };
    } catch (_) {
      "Solution unavailable";
    };
  };

  func parseOpenAiResponse(response : Text) : ?Text {
    if (response.size() > 0) {
      ?response;
    } else {
      null;
    };
  };

  // Daily Practice Count Functions
  public query ({ caller }) func getDailyPracticeCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access daily practice count");
    };
    let userId = caller.toText();
    switch (dailyPracticeCounts.get(userId)) {
      case (null) { 0 };
      case (?dailyCount) { dailyCount.count };
    };
  };

  public shared ({ caller }) func incrementDailyPracticeCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can increment daily practice count");
    };
    let userId = caller.toText();
    let today = getTodayDateString();
    switch (dailyPracticeCounts.get(userId)) {
      case (null) {
        dailyPracticeCounts.add(userId, { date = today; count = 1 });
        1;
      };
      case (?dailyCount) {
        if (dailyCount.date == today) {
          let newCount = dailyCount.count + 1;
          dailyPracticeCounts.add(userId, { date = today; count = newCount });
          newCount;
        } else {
          dailyPracticeCounts.add(userId, { date = today; count = 1 });
          1;
        };
      };
    };
  };

  // Weekly Mock Count Functions
  public query ({ caller }) func getWeeklyMockCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access weekly mock count");
    };
    let userId = caller.toText();
    switch (weeklyMockCounts.get(userId)) {
      case (null) { 0 };
      case (?weeklyCount) { weeklyCount.count };
    };
  };

  public shared ({ caller }) func incrementWeeklyMockCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can increment weekly mock count");
    };
    let userId = caller.toText();
    let currentWeek = getWeekKeyString();
    switch (weeklyMockCounts.get(userId)) {
      case (null) {
        weeklyMockCounts.add(userId, { weekKey = currentWeek; count = 1 });
        1;
      };
      case (?weeklyCount) {
        if (weeklyCount.weekKey == currentWeek) {
          let newCount = weeklyCount.count + 1;
          weeklyMockCounts.add(userId, { weekKey = currentWeek; count = newCount });
          newCount;
        } else {
          weeklyMockCounts.add(userId, { weekKey = currentWeek; count = 1 });
          1;
        };
      };
    };
  };

  // Performance Weakness Update
  public shared ({ caller }) func updatePerformanceWeakness(chapterName : Text, accuracy : Float) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update performance weakness");
    };

    let userId = caller.toText();

    switch (chapters.get(userId)) {
      case (null) { false };
      case (?userChapters) {
        switch (userChapters.get(chapterName)) {
          case (null) { false };
          case (?chapter) {
            let performanceWeakness = Float.max(1, Float.min(5, (100.0 - accuracy) / 20.0));
            let finalWeakness = Float.max(
              1,
              Float.min(
                5,
                (0.4 * chapter.weakness.toInt().toFloat() + 0.6 * performanceWeakness).toInt().toFloat(),
              ),
            );
            let updatedChapter : UserChapter = {
              chapter with weakness = Float.max(1, Float.min(5, finalWeakness)).toInt().toNat();
            };
            userChapters.add(chapterName, updatedChapter);
            true;
          };
        };
      };
    };
  };

  // Mock Result Storage
  public shared ({ caller }) func saveMockResult(score : Int, totalQuestions : Nat, accuracy : Float, physicsCorrect : Nat, chemCorrect : Nat, mathsCorrect : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save mock results");
    };

    let userId = caller.toText();
    let id = Time.now().toText();

    let newResult : MockResult = {
      id;
      timestamp = Time.now();
      score;
      totalQuestions;
      accuracy;
      physicsCorrect;
      chemCorrect;
      mathsCorrect;
    };

    let currentResults = switch (mockResults.get(userId)) {
      case (null) { [] };
      case (?results) { results };
    };

    let updatedResults = currentResults.concat([newResult]);
    mockResults.add(userId, updatedResults);
    id;
  };

  public query ({ caller }) func getMockResults() : async [MockResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access mock results");
    };

    let userId = caller.toText();
    switch (mockResults.get(userId)) {
      case (null) { [] };
      case (?results) { results };
    };
  };

  // Admin Utility Functions
  public shared ({ caller }) func setUserPro(userPrincipal : Text, isPro : Bool) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set user Pro status");
    };

    switch (userSubscriptions.get(userPrincipal)) {
      case (null) {
        if (isPro) {
          userSubscriptions.add(
            userPrincipal,
            { isPro = true; subscriptionExpiresAt = ?(Time.now() + 30 * 24 * 3600 * 1000000000) },
          );
        };
        true;
      };
      case (?_) {
        userSubscriptions.add(
          userPrincipal,
          {
            isPro;
            subscriptionExpiresAt = if (isPro) { ?(Time.now() + 30 * 24 * 3600 * 1000000000) } else {
              null;
            };
          },
        );
        true;
      };
    };
  };

  public query ({ caller }) func getAllUsers() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    userProfiles.keys().toArray();
  };

  // Seed Sample Questions
  public shared ({ caller }) func seedQuestions() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can seed questions");
    };

    let sampleQuestions = [
      ("Physics", "Kinematics", "Easy"),
      ("Chemistry", "Chemical Bonding", "Medium"),
      ("Maths", "Quadratic Equations", "Hard"),
      ("Physics", "Thermodynamics", "Easy"),
      ("Chemistry", "Electrochemistry", "Hard"),
      ("Maths", "Probability", "Medium"),
    ];

    for (i in Nat.range(0, sampleQuestions.size())) {
      let (subject, chapter, difficulty) = sampleQuestions[i];
      ignore await addQuestion(
        "Sample question " # (i + 1).toText(),
        "A",
        "B",
        "C",
        "D",
        "A",
        2024,
        subject,
        chapter,
        difficulty,
        if (subject == "Maths") { "Advanced" } else { "Main" },
      );
    };
  };
};
