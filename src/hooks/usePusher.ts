import Pusher from "pusher-js";

class PusherSingleton {
  private static instance: PusherSingleton;
  public pusher: Pusher | undefined;
  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {
    this.pusher = new Pusher("3850ffa8207ba6389547", {
      cluster: "eu",
    });
  }

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(): PusherSingleton {
    if (!PusherSingleton.instance) {
      PusherSingleton.instance = new PusherSingleton();
    }

    return PusherSingleton.instance;
  }

  /**
   * Finally, any PusherSingleton should define some business logic, which can be
   * executed on its instance.
   */
  public someBusinessLogic() {
    // ...
  }
}

export default function usePusher() {
  const pusherSingleton = PusherSingleton.getInstance();
  return { pusher: pusherSingleton.pusher };
}
