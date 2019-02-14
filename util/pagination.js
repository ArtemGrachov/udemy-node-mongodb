const paginationFactory = (totalItems, itemsPerPage, currentPage) => {
  return {
    currentPage,
    totalItems,
    hasNextPage: itemsPerPage * currentPage < totalItems,
    hasPreviousPage: currentPage > 1,
    nextPage: currentPage + 1,
    previousPage: currentPage - 1,
    lastPage: Math.ceil(totalItems / itemsPerPage)
  }
}

exports.paginationFactory = paginationFactory;