export const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        // Wrap the requestHandler in a Promise and resolve it
        Promise.resolve(requestHandler(req, res, next))
        .catch(err => next(err)); // If any error occurs, pass it to the next middleware
    }
}