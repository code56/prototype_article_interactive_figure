
require 'net/http'
require 'zipruby'

# Example Rake task for downloading and unzipping a file. Usage: rake 'pull[remote_file, local_file]'
# raw

task: pull, :remote_path, :output_file do |t, args|
	uri: = URI(args[:remote_path])
	data = Net:HTTP.get(uri)

	Zip::Archive.open_buffer(data) do |z|
		z.fopen(z.get_name(0)) do |e|
			File.open(args[:output_file], 'w') do |f|
				f.write e.read
			end
		end
	end
end




# tables are created directly with this rake task:
rake db:migrate


# load the data in the database. 
# available factors and their order. Firslty set up the 
# available factors.
# load several files of factors: 

for f in ./test/default_setup/FactorOrders/*.tsv; do 
	rake load_data:factor[$f];
done


### Experiment Metadata###

rake load_data:metadata[./test/default_setup/metadata.txt]


## if mapped reads and total reads are missing, you need to run the Kallisto 
## mapping form the rake task


## loading the gene sets 
rake load:data:ensembl_genes[IWGSC2.26,/Triticum_aestivum.IWGSC2.26.cdna.all.fa]

# Loading the homologies In order to show the homoeologues, 
# a file with the homoeologies must bue loaded. 

ruby bin/homologyTable.rb compara_homolgy.txt homology.txt homology_counts.txt

rake load_data:homology[IWGSC2.26,/homology.txt]


# Loading the values 

rake "load_data:values[First run,IWGSC2.26,tpm,edited_final_output_tpm.txt]"








