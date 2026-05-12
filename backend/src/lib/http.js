export const parseIdParam = (req, res, resourceLabel, paramName = 'id') => {
  const id = Number(req.params[paramName])

  if (Number.isNaN(id)) {
    res.status(400).json({ message: `Invalid ${resourceLabel} ID.` })
    return null
  }

  return id
}