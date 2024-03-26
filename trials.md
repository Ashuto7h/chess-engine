# initiation

- add checkmate, castling, draw

# Trial 1

find all moves, for each move, calculate your total score from all pieces at their current positions, and enemy total score, and substract them to get final score.

# Trial 2

- Convert the moves data to 2d table, with 1 hot encoding all the dimensions of 8x8x12 and drop 1 column. this will give me 7+7+11 = 25 features
- label each move as win or lose(draw)
- train using classifier - knn, RBF svm, decision tree, random forest, ada boost, naive bayes
