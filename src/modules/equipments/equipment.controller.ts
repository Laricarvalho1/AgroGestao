import { isUUID } from "@/lib/uuid";
import { EquipmentService } from "./equipment.service";
import { NextRequest, NextResponse } from "next/server";

export class EquipmentController {

    private equipamentoService = new EquipmentService();

    async getAll() {

        try{
            const allEquipments = await this.equipamentoService.getAll();

            // retorna as informações de todos os equipments para o front
            return NextResponse.json(allEquipments.map(equipment => equipment.getAllInformation()));

        }catch(erro){
            console.error(erro)

            return NextResponse.json({erro : "Erro interno no servidor."}, {status : 500});
        }

    }

    async getById(id: string){

        if (!isUUID(id)) {return NextResponse.json({ erro: "ID inválido." },{ status: 400 });}

        try{
            const equipment = await this.equipamentoService.getById(id)

            return NextResponse.json(equipment.getAllInformation());

        }catch(erro){

            if(erro instanceof Error && erro.message === "Equipamento não encontrado."){
                return NextResponse.json({erro : erro.message},{status : 404})
            };

            console.error(erro)

            return NextResponse.json({erro : "Erro interno no servidor."}, {status : 500});
        }
    }

    async create(req: NextRequest){


        try{

            const dados = await req.json();

            // verifica se os dados enviados pelo front estão no formato correto antes de chamar o service
            if (dados === null || typeof dados !== "object" ||Array.isArray(dados)) {
                return NextResponse.json({ erro: "Dados do equipamento inválidos." },{ status: 400 });
            }

            const equipment = await this.equipamentoService.create(dados)

            // retorna o equipamento cadastrado com o código 201
            return NextResponse.json(equipment.getAllInformation(), {status : 201});

        }catch(erro){

            // verifica se ocorreu algum erro na escrita do JSON enviado pelo front
            if (erro instanceof SyntaxError) {
                return NextResponse.json({ erro: "JSON malformado." },{ status: 400 });
            }
            // identifica os erros de validação e retorna o código 400 para o front
            if(erro instanceof Error && 
            [ 
                "A identificação do equipamento é inválida.",
                "O horímetro não pode ser negativo ou inválido.",
                "Status do equipamento inválido.",
                "A marca do equipamento é inválida.",
                "O modelo do equipamento é inválido.",
                "O ano de fabricação é inválido.",
                "A categoria do equipamento é inválida.",
                "O intervalo de manutenção é inválido.",
                "O ID da propriedade é inválido.",
                "Propriedade não encontrada.",
                "Já existe um equipamento com essa identificação na propriedade."
            ].includes(erro.message)){
                return NextResponse.json({erro : erro.message}, {status : 400})
            }

            // informa quando a propriedade não existe no banco
            if (erro instanceof Error && erro.cause instanceof Error && "code" in erro.cause && erro.cause.code === "23503") {
                return NextResponse.json({erro : "Propriedade não encontrada."}, {status : 400});
            }

            // protege contra cadastros iguais enviados ao mesmo tempo
            if (erro instanceof Error && erro.cause instanceof Error && "code" in erro.cause && erro.cause.code === "23505") {
                return NextResponse.json({erro : "Já existe um equipamento com essa identificação na propriedade."}, {status : 409});
            }

            console.error(erro)
            return NextResponse.json({erro : "Erro interno no servidor."}, {status : 500});

        }
    }

    async update(id: string, req: NextRequest){

        if (!isUUID(id)) {return NextResponse.json({ erro: "ID inválido." },{ status: 400 });}

        try{

            const dados = await req.json()

            // verifica se os dados enviados pelo front estão no formato correto antes de chamar o service
            if (dados === null || typeof dados !== "object" ||Array.isArray(dados)) {
                return NextResponse.json({ erro: "Dados do equipamento inválidos." },{ status: 400 });
            }

            // Status e propriedade só mudam nos fluxos responsáveis por eles
            if ("status" in dados || "property_id" in dados) {
                return NextResponse.json({erro : "Status e propriedade não podem ser alterados nesta rota."}, {status : 400});
            }

            const equipment = await this.equipamentoService.update(id, dados)

            return NextResponse.json(equipment.getAllInformation(), {status : 200})

        }catch(erro){

            // verifica se ocorreu algum erro na escrita do JSON enviado pelo front
            if (erro instanceof SyntaxError) {

                return NextResponse.json({ erro: "JSON malformado." },{ status: 400 });

            }
            // identifica os erros de validação e retorna o código 400 para o front
            if(erro instanceof Error && [
                "O horímetro não pode ser menor que o anterior.",
                "A identificação do equipamento é inválida.",
                "O horímetro não pode ser negativo ou inválido.",
                "Status do equipamento inválido.",
                "A marca do equipamento é inválida.",
                "O modelo do equipamento é inválido.",
                "O ano de fabricação é inválido.",
                "A categoria do equipamento é inválida.",
                "O intervalo de manutenção é inválido.",
                "O ID da propriedade é inválido.",
                "Já existe um equipamento com essa identificação na propriedade."
            ].includes(erro.message)){
                return NextResponse.json({erro : erro.message}, {status : 400})
            };

            if(erro instanceof Error && erro.message === "Equipamento não encontrado."){
                return NextResponse.json({erro : erro.message},{status : 404})
            };


            // conflito quando outra requisição cadastrou a mesma identificação
            if (erro instanceof Error && erro.cause instanceof Error && "code" in erro.cause && erro.cause.code === "23505") {
                return NextResponse.json({erro : "Já existe um equipamento com essa identificação na propriedade."}, {status : 409});
            }

            console.error(erro)
            return NextResponse.json({erro : "Erro interno no servidor."}, {status : 500});
        }
    }

    async remove(id : string){

        if (!isUUID(id)) {
            return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
        }

        try{
            await this.equipamentoService.remove(id)

            // retorna 204 quando exclui com sucesso, sem precisar enviar dados de volta
            return new NextResponse(null, {status : 204});

        }catch(erro){

            if(erro instanceof Error && erro.message === "Equipamento não encontrado."){
                return NextResponse.json({erro : erro.message},{status : 404})  
            };

            // O PostgreSQL impediu remove um equipamento referenciado por alguma OS.
            if (erro instanceof Error && erro.cause instanceof Error && "code" in erro.cause && (erro.cause && erro.cause.code === "23503" || erro.cause.code === "23001")) {
                return NextResponse.json({ erro: "Não é possível excluir um equipamento com ordens de serviço vinculadas." }, { status: 409 });
            }

            console.error(erro)
            return NextResponse.json({erro : "Erro interno no servidor."}, {status : 500});
        }

    }

}