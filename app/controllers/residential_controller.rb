class ResidentialController < ApplicationController
  def index
  end

  def data
    # get the sum of total sales by county
    totals = SalesFigure.group(:jurisdiction).sum(:total_sales)
    render :json => { :totals => totals }
  end
end
