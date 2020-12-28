import firebase from "firebase/app";

require("firebase/auth");
require("firebase/firestore");
require("firebase/functions");

// Creates a user profile
const createOrUpdateProfileData = async (
  db: firebase.firestore.Firestore,
  uid: string
) => {
  // update user collection
  const doc = db.collection("users").doc(uid);
  const docData = await doc.get();
  if (docData.exists) {
    // add a new signature if needed
    await doc.update({
      updated: firebase.firestore.Timestamp.fromDate(new Date(Date.now())),
    });
  } else {
    // create user
    await doc.set({
      uid,
      updated: firebase.firestore.Timestamp.fromDate(new Date(Date.now())),
      signatures: [],
    });
  }
};

// Check if an account exists for the given id and signature,
// otherwise attempt to register
const signInOrRegister = async (
  id: string,
  signature: string,
): Promise<firebase.User | null> => {
  let token: string | null = null;
  try {
    const res = await firebase.functions().httpsCallable("authenticate")({
      signed: signature,
      account: id,
    });

    token = res.data.token;
    if (!token) {
      throw new Error("missing token");
    }
  } catch (e) {
    console.error("Failed to authenticate with token", e);
  }

  let user;
  try {
    user = token && (await firebase.auth().signInWithCustomToken(token)).user
  } catch (e) {
    // FIXME: we should probably handle wrong signatures here, as it would imply
    // some sort of corruption or attack.
    console.error(e);
  }
  if (!user) return null;
  // always create / update profile data
  await createOrUpdateProfileData(
    firebase.firestore(),
    user.uid
  );
  return user;
};

// Check if the user is currently authenticated for the correct address,
// otherwise attempt to sign in or register for that address
// TODO: remove "signature" and only rely on "rawSignature" because
// only rawSignature can be verified
export const getFirebaseUser = async (
  address: string,
  signatures: { rawSignature: string; signature: string }
) => {
  const { currentUser } = firebase.auth();

  if (
    !currentUser ||
    (currentUser.uid !== address)
  ) {
    return signInOrRegister(address, signatures.rawSignature);
  } else {
    return currentUser;
  }
};
