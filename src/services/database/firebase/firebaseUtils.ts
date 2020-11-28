
import firebase from "firebase/app";

require("firebase/auth");
require("firebase/firestore");
require("firebase/functions");

// Creates a user profile that is used for authenticating provision
// to transaction records
// FIXME: don't think this approach really provides value as a user can only ever have one signature
const createOrUpdateProfileData = async (
  db: firebase.firestore.Firestore,
  signature: string,
  uid: string
) => {
  // update user collection
  const doc = db.collection("users").doc(uid);
  const docData = await doc.get();
  if (docData.exists) {
    const data = docData.data();
    if (data && data.signatures.indexOf(signature) < 0) {
      // add a new signature if needed
      await doc.update({
        signatures: data.signatures.concat([signature]),
        updated: firebase.firestore.Timestamp.fromDate(new Date(Date.now())),
      });
    }
  } else {
    // create user
    await doc.set({
      uid,
      updated: firebase.firestore.Timestamp.fromDate(new Date(Date.now())),
      signatures: [signature],
    });
  }
};

// Check if an account exists for the given id and signature,
// otherwise attempt to register
const signInOrRegister = async (
  id: string,
  signatures: { rawSignature: string; signature: string }
): Promise<firebase.User | null> => {
  let token: string | null = null;
  try {
    const res = await firebase.functions().httpsCallable("authenticate")({
      signed: signatures.rawSignature,
      account: id.split("@")[0],
    });

    token = res.data.token;
    if (!token) {
      throw new Error("missing token");
    }
  } catch (e) {
    console.log("No token auth, falling back to email / sig");
  }

  let user;
  try {
    user = token
      ? (await firebase.auth().signInWithCustomToken(token)).user
      : (
        await firebase
          .auth()
          .signInWithEmailAndPassword(id, signatures.signature)
      ).user;
  } catch (e) {
    // FIXME: we should probably handle wrong signatures here, as it would imply
    // some sort of corruption or attack.
    console.error(e);
    if (e.message.includes("There is no user record")) {
      user = (
        await firebase
          .auth()
          .createUserWithEmailAndPassword(id, signatures.signature)
      )?.user;
    }
  }
  if (!user) return null;
  // always create / update profile data
  await createOrUpdateProfileData(
    firebase.firestore(),
    signatures.signature,
    user.uid
  );
  return user;
};

// Check if the user is currently authenticated for the correct address,
// otherwise attempt to sign in or register for that address
export const getFirebaseUser = async (
  address: string,
  host: string,
  signatures: { rawSignature: string; signature: string }
) => {
  const id = `${address.toLowerCase()}@${host}`;
  const { currentUser } = firebase.auth();

  if (
    !currentUser ||
    (currentUser.email && currentUser.email !== id) ||
    (!currentUser.email && currentUser.uid !== address)
  ) {
    return signInOrRegister(id, signatures);
  } else {
    return currentUser;
  }
};
