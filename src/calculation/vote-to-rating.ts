const votingToRating = (vote: number, maxRating: number): number => {
    const rating = Math.round((vote / 10) * maxRating);
    return rating
}

export default votingToRating;