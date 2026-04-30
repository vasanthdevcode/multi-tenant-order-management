export const tenantChecker = async (req, reply) => {
  console.log(req.headers, "***** x-tenant-id");
  const tenantId = req.headers["x-tenant-id"];

  if (!tenantId) {
    return reply
      .status(400)
      .send({ sucess: false, message: "tenantId required" });
  }
};
