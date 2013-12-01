class CreateWalks < ActiveRecord::Migration
  def change
    create_table :walks do |t|
      t.text :start
      t.text :end
      t.integer :interval
      t.timestamps
    end
  end
end
