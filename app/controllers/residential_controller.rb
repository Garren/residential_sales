class ResidentialController < ApplicationController
  def index; end

  def data
    # get the sum of total sales by county
    totals = SalesFigure.group(:jurisdiction).sum(:total_sales)
    render :json => { :totals => totals }
  end

  def bar_chart; end

  def bar_data
    bar_data = SalesFigure.select(:id, :zipcode, :median_value)
                          .where(:jurisdiction => 'Baltimore')
                          .order('median_value DESC, zipcode')
    render :json => { :bar_data => bar_data }
  end

  def scatter_chart; end

  def scatter_data
    data = 
      SalesFigure.select(:id, :zipcode, :jurisdiction, :median_value, :total_sales)
                 .where('median_value > 1000')
                 .order(:jurisdiction)
    render :json => { :scatter_data => data }
  end
end
