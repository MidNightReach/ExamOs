import Map "mo:core/Map";

module {
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

  type OldActor = {
    userProfiles : Map.Map<Text, UserProfile>;
    chapters : Map.Map<Text, Map.Map<Text, UserChapter>>;
  };

  type NewActor = {
    userProfiles : Map.Map<Text, UserProfile>;
    chapters : Map.Map<Text, Map.Map<Text, UserChapter>>;
    userSubscriptions : Map.Map<Text, UserSubscription>;
    userStreaks : Map.Map<Text, UserStreak>;
    monthlyActivity : Map.Map<Text, MonthlyActivity>;
    dailyPlanCounts : Map.Map<Text, DailyPlanCount>;
  };

  public func run(old : OldActor) : NewActor {
    {
      userProfiles = old.userProfiles;
      chapters = old.chapters;
      userSubscriptions = Map.empty<Text, UserSubscription>();
      userStreaks = Map.empty<Text, UserStreak>();
      monthlyActivity = Map.empty<Text, MonthlyActivity>();
      dailyPlanCounts = Map.empty<Text, DailyPlanCount>();
    };
  };
};
