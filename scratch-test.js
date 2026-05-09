async function test() {
  const ids = [1, 2, 3];
  const res = await fetch("https://users.roblox.com/v1/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userIds: ids, excludeBannedUsers: false }),
  });
  console.log("v1/users status:", res.status);
  const data = await res.json();
  console.log("v1/users data:", JSON.stringify(data));
}

test();
